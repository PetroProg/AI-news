from datetime import datetime
from enum import Enum
from typing import Any, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""

    pass


# =====================================================================
# ENUMS 
# =====================================================================

class SourceType(str, Enum):
    """Supported source collector types."""
    RSS = "rss"
    TELEGRAM = "telegram"
    WEB = "web"
    CUSTOM = "custom"


class ArticleStatus(str, Enum):
    """Processing lifecycle status of an article."""
    COLLECTED = "collected"          
    CLEANED = "cleaned"              
    DUPLICATE = "duplicate"          
    FILTERED_OUT = "filtered_out"    
    PROCESSED = "processed"          
    SUMMARIZED = "summarized"        
    REPORTED = "reported"            


class ReportType(str, Enum):
    """Scheduled report types."""
    MORNING = "morning_0800"
    EVENING = "evening_2000"
    CUSTOM = "custom"


# =====================================================================
# MODELS
# =====================================================================

class Source(Base):
    """Information feed source (RSS feed, Telegram channel, website)."""

    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(String(50), nullable=False, default=SourceType.RSS)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fetch_interval_minutes: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    last_fetched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    articles: Mapped[List["Article"]] = relationship("Article", back_populates="source", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Source id={self.id} name='{self.name}' type='{self.source_type}'>"


class Category(Base):
    """Topic category (e.g. AI, Cybersecurity, Linux, Infrastructure)."""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    articles: Mapped[List["Article"]] = relationship("Article", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category id={self.id} name='{self.name}'>"


class Tag(Base):
    """Keywords / tags extracted from articles."""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)

    # Relationships
    article_associations: Mapped[List["ArticleTag"]] = relationship(
        "ArticleTag", back_populates="tag", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Tag id={self.id} name='{self.name}'>"


class ArticleTag(Base):
    """Many-to-Many association between Article and Tag."""

    __tablename__ = "article_tags"

    article_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )

    # Relationships
    article: Mapped["Article"] = relationship("Article", back_populates="tag_associations")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="article_associations")


class Article(Base):
    """Core news article / message entity."""

    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    external_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    original_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    raw_content: Mapped[str] = mapped_column(Text, nullable=False)
    cleaned_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    
    # Deduplication
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    duplicate_of_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="SET NULL"), nullable=True
    )
    
    # AI & Importance (0.0 to 10.0)
    importance_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    status: Mapped[ArticleStatus] = mapped_column(
        String(50), default=ArticleStatus.COLLECTED, nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="articles")
    category: Mapped[Optional["Category"]] = relationship("Category", back_populates="articles")
    summary: Mapped[Optional["Summary"]] = relationship("Summary", back_populates="article", uselist=False, cascade="all, delete-orphan")
    tag_associations: Mapped[List["ArticleTag"]] = relationship(
        "ArticleTag", back_populates="article", cascade="all, delete-orphan"
    )
    report_associations: Mapped[List["ReportArticle"]] = relationship(
        "ReportArticle", back_populates="article", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_articles_source_external_id", "source_id", "external_id"),
        Index("ix_articles_published_status", "published_at", "status"),
    )

    def __repr__(self) -> str:
        return f"<Article id={self.id} title='{self.title[:30]}...' status='{self.status}'>"


class Summary(Base):
    """AI-generated summary and key insights produced by local LLM."""

    __tablename__ = "summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    article_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, unique=True
    )

    short_summary: Mapped[str] = mapped_column(Text, nullable=False)
    why_it_matters: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_points: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)  # List of bullet points

    model_used: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., 'llama3.2:3b'
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    article: Mapped["Article"] = relationship("Article", back_populates="summary")

    def __repr__(self) -> str:
        return f"<Summary id={self.id} article_id={self.article_id} model='{self.model_used}'>"


class Report(Base):
    """Compiled digest / report ready for Telegram dispatch."""

    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[ReportType] = mapped_column(String(50), nullable=False, default=ReportType.MORNING)
    
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    total_articles_collected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_articles_included: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    sent_to_telegram: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    article_associations: Mapped[List["ReportArticle"]] = relationship(
        "ReportArticle", back_populates="report", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Report id={self.id} title='{self.title}' sent={self.sent_to_telegram}>"


class ReportArticle(Base):
    """Ordered Many-to-Many association between Report and included Articles."""

    __tablename__ = "report_articles"

    report_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("reports.id", ondelete="CASCADE"), primary_key=True
    )
    article_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    report: Mapped["Report"] = relationship("Report", back_populates="article_associations")
    article: Mapped["Article"] = relationship("Article", back_populates="report_associations")
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CollectedItem(BaseModel):
    """Standardized data transfer object (DTO) for collected raw news items.
    
    All collectors (RSS, Telegram, Web scraper) MUST convert their raw data
    into this uniform model before handing it to the database/pipeline.
    """

    title: str = Field(..., description="Headline of the story or message")
    raw_content: str = Field(..., description="Raw text or HTML body")
    original_url: Optional[str] = Field(None, description="Direct URL to source article")
    external_id: Optional[str] = Field(None, description="Unique ID from provider (GUID, message ID)")
    author: Optional[str] = Field(None, description="Author or channel name")
    published_at: datetime = Field(..., description="Publication timestamp with timezone")
    language: str = Field("en", description="Detected or default language code")


class BaseCollector(ABC):
    """Abstract Base Class defining the collector interface."""

    def __init__(self, source_name: str, source_url: str) -> None:
        self.source_name = source_name
        self.source_url = source_url

    @abstractmethod
    async def collect(self) -> List[CollectedItem]:
        """Fetch and parse items from the target source.
        
        Must handle its own network errors gracefully and return a list of CollectedItem.
        """
        pass
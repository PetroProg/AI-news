"""Quiz service for dynamic AI challenge generation and caching."""

import asyncio
import json
import logging
import random
import re
from typing import Any, Dict, List, Optional
import httpx
from app.config import get_settings

logger = logging.getLogger("news_ai.quiz")
settings = get_settings()

# Curated fallback banks to ensure zero downtime and instant initial loads
FALLBACK_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "ai": [
        {
            "question": "В чем фундаментальная разница между Temperature и Top-P при генерации текста в LLM?",
            "options": [
                "Temperature масштабирует логиты вероятностей всех токенов, а Top-P динамически отсекает кумулятивный хвост",
                "Temperature задает длину ответа, а Top-P отвечает за точность грамматики",
                "Temperature используется только для картинок, а Top-P — для текста",
                "Они делают абсолютно одно и то же разными математическими формулами"
            ],
            "correct": 0,
            "explanation": "Temperature делит логиты на T (сглаживая или делая пикообразным распределение). Top-P (nucleus sampling) суммирует вероятности сверху вниз и берет только минимальный набор токенов с суммой >= P."
        },
        {
            "question": "Какой формат квантования обеспечивает лучшее соотношение скорость/качество для моделей 7B-14B на 8–12 ГБ VRAM в Ollama?",
            "options": [
                "Q4_K_M (или Q5_K_M) в формате GGUF",
                "FP16 без квантования",
                "Q1_0 экстремальное сжатие",
                "INT8 классический симметричный"
            ],
            "correct": 0,
            "explanation": "Метод k-quants (Q4_K_M) использует смешанную разрядность: критические слои внимания и эмбеддингов квантуются точнее, сохраняя до 99% качества FP16 при падении потребления памяти в 3.5 раза."
        },
        {
            "question": "Что дает технология LoRA (Low-Rank Adaptation) при дообучении нейросетей?",
            "options": [
                "Замораживает исходные веса и обучает две низкоранговые матрицы A и B, снижая VRAM на 70-80%",
                "Автоматически переводит модель на русский язык без датасета",
                "Увеличивает контекстное окно модели в 10 раз",
                "Позволяет запускать модель вообще без видеокарты"
            ],
            "correct": 0,
            "explanation": "LoRA факторизует матрицу дельты весов W = W0 + B*A, где ранг r обычно от 8 до 64. Это позволяет обучать лишь доли процента от общего числа параметров."
        },
        {
            "question": "Что такое RoPE (Rotary Position Embedding) в современных архитектурах LLM (Llama 3, Mistral, Qwen)?",
            "options": [
                "Метод позиционного кодирования через поворот векторов внимания в комплексной плоскости",
                "Система защиты от промпт-инъекций и джейлбрейков",
                "Алгоритм сжатия KV-кэша на диске",
                "Формат упаковки весов для мобильных процессоров"
            ],
            "correct": 0,
            "explanation": "RoPE кодирует относительное расстояние между токенами поворотом векторного пространства Q и K, обеспечивая естественное затухание внимания с расстоянием и легкое масштабирование контекста."
        },
        {
            "question": "Как в архитектуре MoE (Mixture of Experts) в моделях Mixtral и DeepSeek достигается высокая скорость?",
            "options": [
                "Маршрутизатор (Router) активирует только 2 эксперта из 8 на каждый отдельный токен",
                "Модель одновременно запускается на 8 серверах параллельно",
                "Все вычисления переводятся в целочисленный 1-битный формат",
                "Эксперты включаются только при ошибке основной сети"
            ],
            "correct": 0,
            "explanation": "В MoE общие параметры модели огромны (например, 47B), но для обработки каждого токена роутер активирует лишь top-2 FFN-блока (около 13B активных параметров), кардинально экономя вычисления."
        },
        {
            "question": "Что такое KV Cache (Key-Value Cache) в процессе генерации токенов (inference) в декодерных LLM?",
            "options": [
                "Кэширование ранее вычисленных ключей и значений внимания, чтобы не пересчитывать весь контекст заново",
                "Временный файл подкачки на жестком диске для нехватки оперативной памяти",
                "Словарь соответствия токенов и строковых представлений слов",
                "База данных для сохранения диалогов пользователей"
            ],
            "correct": 0,
            "explanation": "KV-кэш хранит векторы Key и Value для всех предыдущих токенов последовательности, благодаря чему каждый новый токен вычисляется со сложностью O(N) вместо O(N^2)."
        }
    ],
    "linux": [
        {
            "question": "Какой командой мгновенно найти и завершить процесс, слушающий TCP-порт 8080?",
            "options": [
                "fuser -k 8080/tcp (или kill $(lsof -t -i:8080))",
                "netstat --kill 8080",
                "systemctl kill port 8080",
                "iptables -D INPUT 8080"
            ],
            "correct": 0,
            "explanation": "Утилита fuser с флагом -k отправляет сигнал SIGKILL процессам, использующим порт. kill $(lsof -t -i:8080) также отлично справляется."
        },
        {
            "question": "Под в Kubernetes перешёл в статус CrashLoopBackOff. Какой командой быстрее всего посмотреть логи предыдущего упавшего контейнера?",
            "options": [
                "kubectl logs <pod-name> --previous",
                "kubectl describe pod <pod-name> --logs",
                "kubectl get events --crash",
                "journalctl -u k8s-pod --last"
            ],
            "correct": 0,
            "explanation": "Флаг --previous (или -p) указывает kubectl извлечь логи контейнера до его последнего падения/рестарта, что критично для выявления причин OOMKilled или panic."
        },
        {
            "question": "Как перезапустить systemd-сервис только в том случае, если он уже запущен (не запуская выключенный)?",
            "options": [
                "systemctl try-restart <service>",
                "systemctl restart --if-running <service>",
                "systemctl reload-or-restart <service>",
                "service <service> conditional-restart"
            ],
            "correct": 0,
            "explanation": "Команда 'systemctl try-restart' (или 'condrestart') перезапускает юнит только если он активен. Для остановленных сервисов команда ничего не делает."
        },
        {
            "question": "В Docker накопилось много dangling-образов, неиспользуемых сетей и остановленных контейнеров. Как очистить всё безопасной одной командой?",
            "options": [
                "docker system prune -f",
                "docker clean --all",
                "docker rm -f $(docker ps -aq)",
                "rm -rf /var/lib/docker/overlay2"
            ],
            "correct": 0,
            "explanation": "docker system prune очищает остановленные контейнеры, неиспользуемые сети, dangling-образы и кэш сборки без удаления именованных томов данных."
        },
        {
            "question": "Диск переполнен (100% full), но rm не освобождает место: df -h всё ещё показывает 0 доступных байт. В чём причина?",
            "options": [
                "Файл удалён, но удерживается открытым запущенным процессом (проверить lsof +L1)",
                "Файловая система автоматически заблокировалась в read-only",
                "Закончились дескрипторы сокетов",
                "Требуется обязательный перезапуск ядра Linux"
            ],
            "correct": 0,
            "explanation": "В Linux удаление файла (unlink) уменьшает счётчик ссылок. Если файл открыт процессом, блоки диска не освободятся до закрытия дескриптора или перезапуска процесса: 'lsof +L1' покажет виновника."
        },
        {
            "question": "Какая команда покажет размер файлов и папок в текущей директории с сортировкой по убыванию в читаемом виде?",
            "options": [
                "du -sh * | sort -hr",
                "df -h --sort=size",
                "ls -l --sort-bytes",
                "find . -size +100M"
            ],
            "correct": 0,
            "explanation": "du -sh * суммирует размер каждого элемента в human-readable формате, а sort -hr корректно сортирует суффиксы K, M, G в порядке убывания."
        },
        {
            "question": "Как проверить корректность конфигурационных файлов Nginx без перезагрузки и простоя веб-сервера?",
            "options": [
                "nginx -t",
                "systemctl check nginx",
                "nginx --verify-config",
                "cat /etc/nginx/nginx.conf | test"
            ],
            "correct": 0,
            "explanation": "Команда 'nginx -t' проверяет синтаксис всех подключенных директив и выводит [ok] / [successful] либо точный номер строки с ошибкой."
        },
        {
            "question": "Какая современная утилита в Linux заменяет устаревший netstat для быстрого просмотра слушающих сокетов?",
            "options": [
                "ss -tulpn",
                "sockstat -a",
                "ip route show all",
                "portstat -l"
            ],
            "correct": 0,
            "explanation": "Утилита ss (Socket Statistics) читает данные напрямую из пространства ядра через netlink, работая в разы быстрее netstat."
        },
        {
            "question": "Как просмотреть события ядра в реальном времени, включая OOM-killer и сбои драйверов?",
            "options": [
                "dmesg -wH",
                "tail -f /proc/kcore",
                "journalctl --kernel --nowait",
                "sysctl -a | grep error"
            ],
            "correct": 0,
            "explanation": "dmesg с ключами -w (follow/watch) и -H (human-readable timestamps) выводит кольцевой буфер ядра в реальном времени с читаемыми датами."
        }
    ],
    "it": [
        {
            "lang": "Python",
            "code": "def add_item(val, lst=[]):\n    lst.append(val)\n    return lst\n\nprint(add_item(1))\nprint(add_item(2))",
            "question": "Что напечатает данный код при выполнении?",
            "options": [
                "[1] затем [1, 2]",
                "[1] затем [2]",
                "[1] затем [1]",
                "TypeError: mutable default argument"
            ],
            "correct": 0,
            "explanation": "Дефолтный аргумент lst=[] создаётся один раз при определении функции, а не при каждом вызове. Поэтому список сохраняет состояние между вызовами."
        },
        {
            "lang": "JavaScript",
            "code": "console.log([] + []);\nconsole.log([] + {});",
            "question": "Каков результат обоих выражений в консоли?",
            "options": [
                '"" (пустая строка) и "[object Object]"',
                '"" и undefined',
                '[] и {}',
                'NaN и NaN'
            ],
            "correct": 0,
            "explanation": "Оператор + приводит операнды к примитивам. [].toString() даёт \"\", а {}.toString() даёт \"[object Object]\". Результаты: \"\" и \"[object Object]\"."
        },
        {
            "lang": "Go",
            "code": "s := []int{1, 2, 3}\nfor _, v := range s {\n    go func() { println(v) }()\n}",
            "question": "В классическом Go (до версии 1.22) что чаще всего выведет эта программа?",
            "options": [
                "3 3 3 (значение последней итерации для всех горутин)",
                "1 2 3 строго по порядку",
                "3 2 1",
                "Ошибка компиляции: variable shadow"
            ],
            "correct": 0,
            "explanation": "До Go 1.22 переменная v замыкалась по ссылке на одну и ту же область памяти. К моменту старта горутин цикл уже заканчивался со значением 3."
        },
        {
            "lang": "Rust",
            "code": "let s1 = String::from(\"hello\");\nlet s2 = s1;\nprintln!(\"{}\", s1);",
            "question": "Что произойдет при компиляции данного кода?",
            "options": [
                "Ошибка компиляции: use of moved value `s1`",
                "Напечатает hello",
                "Напечатает пустую строку",
                "Паника в рантайме: NullPointerException"
            ],
            "correct": 0,
            "explanation": "При присваивании let s2 = s1 владение (ownership) перемещается в s2. Тип String не реализует трейт Copy, поэтому s1 становится невалидным."
        },
        {
            "lang": "C++",
            "code": "int a = 5;\nint b = a++ + ++a;\nstd::cout << b;",
            "question": "Каково поведение данного выражения согласно стандартам C++?",
            "options": [
                "Undefined Behavior (UB) из-за множественной модификации без точки следования",
                "Всегда строго 12",
                "Всегда строго 11",
                "Ошибка компиляции: duplicate increment"
            ],
            "correct": 0,
            "explanation": "Модификация одной и той же скалярной переменной дважды в одном выражении без промежуточной точки следования (sequence point) является классическим Undefined Behavior."
        },
        {
            "lang": "Python",
            "code": "a = [1, 2, 3]\nb = a\na += [4]\nprint(b)",
            "question": "Что выведет print(b)?",
            "options": [
                "[1, 2, 3, 4]",
                "[1, 2, 3]",
                "None",
                "[4]"
            ],
            "correct": 0,
            "explanation": "Для списков оператор += вызывает in-place метод __iadd__ (аналог extend), изменяя существующий объект по ссылке. b ссылается на тот же список."
        }
    ]
}

# In-memory storage for dynamically generated questions across sessions
# category -> list of dicts
_GENERATED_STORAGE: Dict[str, List[Dict[str, Any]]] = {
    "ai": list(FALLBACK_BANKS["ai"]),
    "linux": list(FALLBACK_BANKS["linux"]),
    "it": list(FALLBACK_BANKS["it"]),
}

_GENERATING_LOCKS: Dict[str, asyncio.Lock] = {
    "ai": asyncio.Lock(),
    "linux": asyncio.Lock(),
    "it": asyncio.Lock(),
}


class QuizService:
    """Service to deliver dynamic AI challenges with background pre-fetching."""

    @classmethod
    async def get_next_question(cls, category: str, exclude_questions: Optional[List[str]] = None) -> Dict[str, Any]:
        """Return the next unique question for the given category.
        
        Triggers background generation if the pool is running low.
        """
        cat_key = category.lower().strip()
        if "linux" in cat_key or "devops" in cat_key:
            cat = "linux"
        elif "it" in cat_key or "code" in cat_key or "программирование" in cat_key:
            cat = "it"
        else:
            cat = "ai"

        pool = _GENERATED_STORAGE[cat]
        exclude_set = set(q.strip().lower() for q in (exclude_questions or []))

        # Find candidates not seen recently
        candidates = [q for q in pool if q.get("question", "").strip().lower() not in exclude_set]

        # Trigger background generation if pool has fewer than 10 unseen candidates
        if len(candidates) < 8:
            asyncio.create_task(cls._generate_and_store(cat))

        if candidates:
            # Pick a candidate, prefer newer ones
            chosen = random.choice(candidates[-5:] if len(candidates) >= 5 else candidates)
            return cls._format_response(chosen, cat)

        # If everything is excluded, try to generate synchronously with a fast timeout (6s)
        try:
            new_q = await asyncio.wait_for(cls._generate_and_store(cat), timeout=6.0)
            if new_q:
                return cls._format_response(new_q, cat)
        except Exception:
            pass

        # Fallback to a random item from the pool
        chosen = random.choice(pool)
        return cls._format_response(chosen, cat)

    @classmethod
    def _format_response(cls, item: Dict[str, Any], cat: str) -> Dict[str, Any]:
        res = {
            "category": cat,
            "question": item.get("question", ""),
            "options": list(item.get("options", [])),
            "correct": item.get("correct", 0),
            "explanation": item.get("explanation", ""),
            "is_ai_generated": item.get("is_ai_generated", False)
        }
        if cat == "it":
            res["lang"] = item.get("lang", "Python")
            res["code"] = item.get("code", "")
        elif item.get("code"):
            res["code"] = item.get("code")
        return res

    @classmethod
    async def _generate_and_store(cls, category: str) -> Optional[Dict[str, Any]]:
        """Generate a new challenge using the local Ollama LLM and append to memory."""
        lock = _GENERATING_LOCKS[category]
        if lock.locked():
            return None  # Generation already in progress for this category

        async with lock:
            try:
                item = await cls._call_llm_for_quiz(category)
                if item:
                    item["is_ai_generated"] = True
                    # Check for duplicates
                    existing = {q.get("question", "").strip().lower() for q in _GENERATED_STORAGE[category]}
                    if item.get("question", "").strip().lower() not in existing:
                        _GENERATED_STORAGE[category].append(item)
                        logger.info("Successfully generated new AI quiz for [%s]: %s", category, item.get("question")[:50])
                        return item
            except Exception as e:
                logger.error("Failed to generate AI quiz for [%s]: %s", category, e)
            return None

    @classmethod
    async def _call_llm_for_quiz(cls, category: str) -> Optional[Dict[str, Any]]:
        """Query Ollama with customized prompts depending on category."""
        base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        model = settings.OLLAMA_MODEL

        topics_map = {
            "ai": [
                "Архитектура LLM (Transformer, Attention, KV-Cache, RoPE)",
                "Квантование и оптимизация (GGUF, AWQ, EXL2, FP8, bitsandbytes)",
                "Дообучение и адаптация (LoRA, QLoRA, DPO, RLHF, SFT)",
                "Инференс и Serving (vLLM, Ollama, TensorRT-LLM, speculative decoding)",
                "Retrieval-Augmented Generation (RAG, векторные базы, hybrid search, rerankers)",
                "Мультимодальные модели (CLIP, Vision-Language Models, Whisper, Flux, diffusion)"
            ],
            "linux": [
                "Linux команды и траблшутинг (systemd, journalctl, lsof, fuser, ss, ps, strace)",
                "Сети и фаервол (iptables, nftables, tcpdump, ip route, DNS resolve, bridge)",
                "Контейнеризация и Docker (cgroups, namespaces, docker compose, storage drivers, multi-stage)",
                "Kubernetes основы (Pod lifecycle, CrashLoopBackOff, Ingress, Services, ConfigMap)",
                "Файловые системы и память (ext4, zfs, tmpfs, swap, OOM-killer, inode exhaustion, du/df)",
                "CI/CD и автоматизация (Bash scripts, Ansible, Git, SSH ключи и туннелирование)"
            ],
            "it": [
                "Python (генераторы, GIL, декораторы, асинхронность asyncio, dunder методы)",
                "JavaScript / TypeScript (Event Loop, промисы, замыкания, прототипы, типизация)",
                "Go (горутины, каналы, race condition, interfaces, garbage collection)",
                "Rust (Ownership, borrowing, lifetimes, Option/Result, traits)",
                "Базы данных и SQL (индексы B-Tree, ACID, транзакции, deadlock, EXPLAIN ANALYZE)"
            ]
        }

        topic = random.choice(topics_map.get(category, topics_map["ai"]))

        if category == "it":
            langs = ["Python", "JavaScript", "Go", "Rust", "C++", "SQL"]
            chosen_lang = random.choice(langs)
            system_prompt = (
                "Ты — senior software engineer и преподаватель Computer Science. "
                "Создай практическую задачу с коротким фрагментом кода (3-6 строк) на языке " + chosen_lang + ". "
                "Вопрос должен проверять понимание нюансов работы рантайма, типизации или тонкостей языка. "
                "Язык текста: СТРОГО русский. Ответ должен быть СТРОГО валидным JSON без markdown:\n"
                "{\n"
                '  "lang": "' + chosen_lang + '",\n'
                '  "code": "короткий код с переносами строк \\n",\n'
                '  "question": "Что выведет этот код или каков будет результат?",\n'
                '  "options": ["Правильный ответ", "Ложный ответ 1", "Ложный ответ 2", "Ложный ответ 3"],\n'
                '  "correct": 0,\n'
                '  "explanation": "Четкое объяснение на 1-2 предложения почему верен первый вариант."\n'
                "}\n"
                "ВАЖНО: Первый вариант в options (индекс 0) ВСЕГДА должен быть строго правильным ответом!"
            )
            user_prompt = f"Придумай интересную задачу по {chosen_lang} на тему: {topic}."
        elif category == "linux":
            system_prompt = (
                "Ты — senior DevOps / SRE инженер. "
                "Создай практическую задачу по Linux, сетям, Docker, Kubernetes или системному траблшутингу на русском языке. "
                "Ответ должен быть СТРОГО валидным JSON без markdown:\n"
                "{\n"
                '  "question": "Конкретная практическая ситуация или вопрос по Linux/DevOps",\n'
                '  "code": "пример команды bash или вывода ошибки (если нужно, иначе пустая строка)",\n'
                '  "options": ["Правильный ответ/команда", "Неверный вариант 1", "Неверный вариант 2", "Неверный вариант 3"],\n'
                '  "correct": 0,\n'
                '  "explanation": "Четкое объяснение на 1-2 предложения почему этот вариант правильный."\n'
                "}\n"
                "ВАЖНО: Первый вариант в options (индекс 0) ВСЕГДА должен быть строго правильным ответом!"
            )
            user_prompt = f"Придумай практическую DevOps задачу на тему: {topic}."
        else: # ai
            system_prompt = (
                "Ты — ведущий AI/ML исследователь. "
                "Создай техническую мини-задачу по архитектуре LLM, нейросетям, инференсу или обучению моделей на русском языке. "
                "Ответ должен быть СТРОГО валидным JSON без markdown:\n"
                "{\n"
                '  "question": "Четкий вопрос о принципах работы нейросетей, трансформеров или LLM",\n'
                '  "options": ["Правильный ответ", "Неверный вариант 1", "Неверный вариант 2", "Неверный вариант 3"],\n'
                '  "correct": 0,\n'
                '  "explanation": "Понятное научное объяснение на 1-2 предложения."\n'
                "}\n"
                "ВАЖНО: Первый вариант в options (индекс 0) ВСЕГДА должен быть строго правильным ответом!"
            )
            user_prompt = f"Придумай задачу по современному AI на тему: {topic}."

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.85,
                "num_predict": 450
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{base_url}/api/chat", json=payload)
            resp.raise_for_status()
            data = resp.json()

        content = data.get("message", {}).get("content", "").strip()
        if not content:
            return None

        # Clean potential markdown wrapping
        if "```" in content:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
            if match:
                content = match.group(1).strip()

        try:
            parsed = json.loads(content)
        except Exception:
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1 and end > start:
                parsed = json.loads(content[start:end+1])
            else:
                return None

        if not isinstance(parsed, dict):
            return None

        if not parsed.get("question") or not isinstance(parsed.get("options"), list) or len(parsed.get("options", [])) != 4:
            return None

        if not parsed.get("explanation"):
            parsed["explanation"] = "Правильный ответ: " + str(parsed["options"][0])

        parsed["correct"] = 0
        return parsed


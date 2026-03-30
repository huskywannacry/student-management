from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/website_management"

    model_config = {"env_file": ".env"}


settings = Settings()

from typing import Optional, List
from pydantic import BaseModel


class DashboardMetrics(BaseModel):
    total_articles: int
    published_articles: int
    pending_approvals: int
    total_users: int
    total_categories: int
    total_views: int


class PopularArticle(BaseModel):
    id: int
    title: str
    view_count: int
    average_rating: Optional[float] = None


class UserActivity(BaseModel):
    user_id: int
    name: str
    article_count: int
    last_active: Optional[str] = None


class ArticleTrend(BaseModel):
    month: str   # "YYYY-MM"
    count: int


class AuthorActivityReport(BaseModel):
    user_id: int
    name: str
    department: Optional[str] = None
    article_count: int
    total_views: int
    avg_rating: Optional[float] = None


class EngagementStats(BaseModel):
    total_comments: int
    total_ratings: int
    total_bookmarks: int
    avg_rating: Optional[float] = None

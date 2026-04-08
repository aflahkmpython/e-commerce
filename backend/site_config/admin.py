from django.contrib import admin
from django.utils.html import format_html
from .models import SiteConfig, FeaturedProduct, HeroSlide

@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'title', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'subtitle')
    readonly_fields = ('image_preview_large',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: auto; border-radius: 4px;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = 'Preview'

    def image_preview_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 300px; height: auto; border-radius: 8px;" />', obj.image.url)
        return "No Image"
    image_preview_large.short_description = 'Large Preview'

admin.site.register(SiteConfig)
admin.site.register(FeaturedProduct)

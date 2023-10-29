from django.contrib import admin
from .models import Author
# Register your models here.

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display =('username','is_approved')
    list_filter = ('is_approved',)
    actions = ['approve_authors', 'disapprove_authors']
    readonly_fields = ('id',)

    def approve_authors(self, request, queryset):
        queryset.update(is_approved=True)
    def reject_authors(self, request, queryset):
        queryset.update(is_approved=False)
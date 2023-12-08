from django.contrib import admin
from .models import *
from rest_framework.authtoken.admin import TokenAdmin
# Register your models here.

@admin.register(Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display =('username','is_approved')
    list_filter = ('is_approved',)
    actions = ['approve_authors', 'disapprove_authors']
    readonly_fields = ('uid',)

    def approve_authors(self, request, queryset):
        queryset.update(is_approved=True)
    def reject_authors(self, request, queryset):
        queryset.update(is_approved=False)
        
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Friendship)
admin.site.register(Inbox_Item)


TokenAdmin.raw_id_fields = ['user']
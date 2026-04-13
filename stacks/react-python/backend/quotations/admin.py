# quotations/admin.py
from django.contrib import admin
from quotations.models import Quotation, QuotationItem


class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 0
    readonly_fields = ('subtotal', 'tax_amount', 'total')


@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'status', 'version', 'total', 'created_at')
    list_filter = ('status', 'tenant')
    search_fields = ('customer__name',)
    readonly_fields = ('subtotal', 'tax_amount', 'total', 'created_at', 'updated_at')
    inlines = [QuotationItemInline]


@admin.register(QuotationItem)
class QuotationItemAdmin(admin.ModelAdmin):
    list_display = ('description', 'quantity', 'unit_price', 'total', 'quotation')
    readonly_fields = ('subtotal', 'tax_amount', 'total')
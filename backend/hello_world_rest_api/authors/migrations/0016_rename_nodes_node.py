# Generated by Django 4.2.6 on 2023-11-21 10:02

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('authors', '0015_nodes'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Nodes',
            new_name='Node',
        ),
    ]
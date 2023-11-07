# Generated by Django 4.2.6 on 2023-11-07 03:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authors', '0008_alter_author_profilepicture_alter_post_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='privacy',
            field=models.CharField(choices=[('PUBLIC', 'Public'), ('UNLISTED', 'Unlisted'), ('PRIVATE', 'Private')], default='PUBLIC', max_length=10),
        ),
    ]

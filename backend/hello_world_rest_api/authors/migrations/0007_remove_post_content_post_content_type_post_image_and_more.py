# Generated by Django 4.2.6 on 2023-10-29 22:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authors', '0006_merge_0005_author_profilepicture_0005_like'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='content',
        ),
        migrations.AddField(
            model_name='post',
            name='content_type',
            field=models.CharField(choices=[('TEXT', 'Text'), ('IMAGE', 'Image')], default='TEXT', max_length=10),
        ),
        migrations.AddField(
            model_name='post',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='media/postimages/'),
        ),
        migrations.AddField(
            model_name='post',
            name='image_url',
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='post',
            name='text',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class GameConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time game updates"""
    
    async def connect(self):
        self.room_group_name = 'game_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'ping':
            await self.send(text_data=json.dumps({
                'type': 'pong'
            }))
    
    async def game_update(self, event):
        """Receive game update from room group and send to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'data': event['data']
        }))
    
    async def new_tag(self, event):
        """Receive new tag notification"""
        await self.send(text_data=json.dumps({
            'type': 'new_tag',
            'data': event['data']
        }))
    
    async def leaderboard_update(self, event):
        """Receive leaderboard update"""
        await self.send(text_data=json.dumps({
            'type': 'leaderboard_update',
            'data': event['data']
        }))

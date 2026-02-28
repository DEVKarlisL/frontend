from channels.generic.websocket import AsyncWebsocketConsumer
import json


class AuctionConsumer(AsyncWebsocketConsumer):
	"""Minimal WebSocket consumer for auction rooms.

	This provides connect/disconnect and simple message broadcasting to the
	auction group. It is intentionally lightweight to satisfy routing imports
	and allow the dev server to start.
	"""

	async def connect(self):
		self.auction_id = self.scope.get('url_route', {}).get('kwargs', {}).get('auction_id')
		self.group_name = f"auction_{self.auction_id}"
		print(f"[WS] CONNECT: auction_id={self.auction_id}, channel={self.channel_name}")
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		print(f"[WS] DISCONNECT: auction_id={self.auction_id}, channel={self.channel_name}, close_code={close_code}")
		await self.channel_layer.group_discard(self.group_name, self.channel_name)

	async def receive(self, text_data=None, bytes_data=None):
		if text_data:
			try:
				data = json.loads(text_data)
			except Exception:
				data = {"message": text_data}
		else:
			data = {"message": ""}

		# Broadcast incoming message to the auction group
		await self.channel_layer.group_send(
			self.group_name,
			{"type": "auction.message", "message": data},
		)

	async def auction_message(self, event):
		# Send event message to WebSocket
		await self.send(text_data=json.dumps(event.get("message", {})))

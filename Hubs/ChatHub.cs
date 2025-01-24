using Microsoft.AspNetCore.SignalR;

namespace SignalRDemo.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string user, string message)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(message))
            {
                throw new HubException("Username and message are required.");
            }

            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            await Clients.All.SendAsync("ReceiveMessage", user, message, timestamp);
        }

        public override async Task OnConnectedAsync()
        {
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            await Clients.All.SendAsync("UserConnected", Context.ConnectionId, timestamp);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            await Clients.All.SendAsync("UserDisconnected", Context.ConnectionId, timestamp);
            await base.OnDisconnectedAsync(exception);
        }
    }
} 
// src/TwilioClient.js
import { Client as TwilioClient } from '@twilio/conversations';

let conversationsClient;

export const initializeTwilioClient = async (token, setMessages) => {

    console.log('token', token)

    try {
        if (!token) {
            return undefined;
        }
        conversationsClient = new TwilioClient(token);
        console.log('Client initialized successfully');

        conversationsClient.on('connectionStateChanged', (state) => {
            console.log('Connection state changed:', state);
        });

        conversationsClient.on("conversationUpdated", async ({ conversation, updateReasons }) => {
            const conversationsss = await getConversation(conversation.sid);
            const messages = await getMessages(conversationsss);
            setMessages(messages.items);
        });
        return conversationsClient;
    } catch (error) {
        console.error('Error initializing Conversations Client:', error.message);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        return undefined;
    }

};

export const getConversation = async (conversationSid) => {
    // console.log('conversationSid', conversationSid, conversationsClient)
    if (!conversationsClient) throw new Error('Client not initialized');
    const conversation = await conversationsClient.getConversationBySid(conversationSid);
    // console.log("conversation", conversation);

    return conversation;
};

export const getMessages = async (conversation) => {
    const messages = await conversation.getMessages();
    return messages;
};

export const sendMessage = async (conversation, message) => {
    await conversation.sendMessage(message);
}

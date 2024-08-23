// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { initializeTwilioClient, getConversation, getMessages } from './twilioClient';


function TwillioChat() {
    const [conversationName, setConversationName] = useState('');
    const [conversationSid, setConversationSid] = useState('');
    const [participantIdentity, setParticipantIdentity] = useState('');
    const [messageBody, setMessageBody] = useState('');
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [participantId, setParticipantId] = useState('')
    const [participants, setParticipants] = useState([])
    const [conversation, setConversation] = useState(null);
    const [client, setClient] = useState(null);

    const [token, setToken] = useState(''); // Replace with your actual token


    useEffect(() => {
        const initialize = async () => {
            try {
                const client = await initializeTwilioClient(token, setMessages);
                if (client)
                    setClient(client)
            } catch (err) {
                console.error('Error initializing Twilio Conversations client:', err);
            }
        };

        initialize();
    }, [token, messages]);


    const generateToken = async () => {
        try {
            const result = await axios.post('http://localhost:5005/token', { identity: participantIdentity, conversationSid: conversationSid });
            console.log('result', result)
            setToken(result.data.token)
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setResponse(null);
        }
    }
    const handleCreateConversation = async () => {
        try {
            const result = await axios.post('http://localhost:5005/create-conversation', { friendlyName: conversationName });
            setConversationSid(result.data.sid);
            setResponse(`Conversation created with SID: ${result.data.sid}`);
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setResponse(null);
        }
    };

    const handleAddParticipant = async () => {
        try {
            const result = await axios.post('http://localhost:5005/add-participant', { conversationSid, identity: participantIdentity });
            setResponse(`Participant added: ${result.data.identity}`);
            setParticipantId(result.data.sid)
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setResponse(null);
        }
    };

    const handleSendMessage = async () => {
        try {

            const conversation = await getConversation(conversationSid);
            const result = await conversation.sendMessage(messageBody);
            // const result = await axios.post('http://localhost:5005/send-message', { conversationSid, body: messageBody, participantSid: participantId, author: participantIdentity });
            // setResponse(`Message sent: ${result.data.sid}`);
            console.log('result', result)
            // setResponse(`Message sent: ${result.data.sid}`);
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setResponse(null);
        }
    };
    const handleFetchConversations = async () => {
        try {
            const result = await axios.get('http://localhost:5005/list-conversations');
            setConversations(result.data);
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setConversations([]);
        }
    };

    const handleFetchMessages = async () => {
        // try {
        //     const result = await axios.get(`http://localhost:5005/list-messages/${conversationSid}`);
        //     setMessages(result.data);
        //     setError(null);
        // } catch (err) {
        //     setError(err.response ? err.response.data.error : err.message);
        //     setMessages([]);
        // }

        try {
            const conversation = await getConversation(conversationSid);
            const messages = await getMessages(conversation);
            // console.log('messages', messages)
            setMessages(messages.items); // .items is used to access the array of messages

            messages.items.forEach(element => {
                console.log(element.state.timestamp);

            });
            setError(null);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.message);
        }
    };

    const handleFetchParticipants = async () => {
        try {
            const result = await axios.get(`http://localhost:5005/participants/${conversationSid}`);
            setParticipants(result.data);
            setError(null);
        } catch (err) {
            setError(err.response ? err.response.data.error : err.message);
            setParticipants([]);
        }
    };

    return (
        <div className="App">
            <h1>Twilio Conversations Demo</h1>
            <div>
                <h2>Fetch Conversations</h2>
                <button onClick={handleFetchConversations}>Fetch Conversations</button>
            </div>
            {conversations.length > 0 && (
                <div>
                    <h2>Conversations</h2>
                    <ul>
                        {conversations.map((conv) => (
                            <li key={conv.sid}>
                                <strong>{conv.friendlyName}</strong> (SID: {conv.sid})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <div>
                <h2>Create Conversation</h2>
                <input
                    type="text"
                    placeholder="Conversation Name"
                    value={conversationName}
                    onChange={(e) => setConversationName(e.target.value)}
                />
                <button onClick={handleCreateConversation}>Create Conversation</button>
            </div>

            <div>
                <h2>Add Participant</h2>
                <input
                    type="text"
                    placeholder="Conversation SID"
                    value={conversationSid}
                    onChange={(e) => setConversationSid(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Participant Identity"
                    value={participantIdentity}
                    onChange={(e) => setParticipantIdentity(e.target.value)}
                />
                <button onClick={handleAddParticipant}>Add Participant</button>
            </div>
            <div>
                <h2>Fetch Participants</h2>
                <input
                    type="text"
                    placeholder="Conversation SID"
                    value={conversationSid}
                    onChange={(e) => setConversationSid(e.target.value)}
                />
                <button onClick={handleFetchParticipants}>Fetch Participants</button>
            </div>
            {participants.length > 0 && (
                <div>
                    <h2>Participants</h2>
                    <ul>
                        {participants.map((participant) => (
                            <li key={participant.sid}>
                                <strong>SID:</strong> {participant.sid} <br />
                                <strong>Identity:</strong> {participant.identity} <br />
                                <strong>Last Message Date:</strong> {participant.dateUpdated}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <div>
                <h2>Generate Token for Identity</h2>
                <input
                    type="text"
                    placeholder="Identity"
                    value={participantIdentity}
                    onChange={(e) => setParticipantIdentity(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Conversation Sid"
                    value={conversationSid}
                    onChange={(e) => setConversationSid(e.target.value)}
                />
                <button onClick={generateToken}>Generate Token</button>
            </div>

            <div>
                <h2>Send Message</h2>
                <input
                    type="text"
                    placeholder="Conversation SID"
                    value={conversationSid}
                    onChange={(e) => setConversationSid(e.target.value)}
                />
                <textarea
                    placeholder="Message Body"
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send Message</button>
            </div>

            {response && <p>Response: {response}</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}


            <div>
                <input
                    type="text"
                    placeholder="Conversation SID"
                    value={conversationSid}
                    onChange={(e) => setConversationSid(e.target.value)}
                />
                <h2>Fetch Messages</h2>
                <button onClick={handleFetchMessages}>Fetch Messages</button>
            </div>
            {messages.length > 0 && (
                <div>
                    <h2>Messages</h2>
                    <ul>
                        {messages.map((msg) => (
                            <li key={msg.sid}>
                                <strong>{msg.author || 'Anonymous'}:</strong> {msg.body}
                                <strong>Created:</strong> {new Date(msg.state.timestamp).toLocaleString() || 'Unknown Date'}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
}

export default TwillioChat;

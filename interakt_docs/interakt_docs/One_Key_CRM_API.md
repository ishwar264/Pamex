<!-- interakt_docs/One_Key_CRM_API.md-->

# Interakt Public API Documentation

**Base URL**: `https://api.interakt.ai/v1/public/`
**Authentication**: Basic Auth
*   **Header**: `Authorization: Basic <YOUR_API_KEY>`
    *   *Note: Base64 encode your API Key if using standard Basic Auth libraries, or use the key directly if the client supports it as a token.*
**Content-Type**: `application/json`

---

## 1. User & Event Tracking

### 1.1 Track User
Creates or updates a user with specific traits.
*   **Method**: `POST`
*   **Endpoint**: `https://api.interakt.ai/v1/public/track/users/`
*   **Payload**:
    ```json
    {
        "phoneNumber": "9999999999",
        "countryCode": "+91",
        "traits": {
            "email": "abc@gmail.com",
            "name": "John Doe",
            "dob": "1990-01-01"
        },
        "tags": ["new_user", "lead"]
    }
    ```
*   **Response**:
    ```json
    {
        "result": true,
        "message": "User tracked successfully",
        "id": "user-unique-id"
    }
    ```

### 1.2 Track Events
Records a specific event for a user.
*   **Method**: `POST`
*   **Endpoint**: `https://api.interakt.ai/v1/public/track/events/`
*   **Payload**:
    ```json
    {
        "userId": "user-unique-id",
        "phoneNumber": "9999999999",
        "countryCode": "+91",
        "event": "Order Placed",
        "traits": {
            "orderId": "ORD-123",
            "amount": 500,
            "currency": "USD"
        }
    }
    ```
*   **Response**:
    ```json
    {
        "result": true,
        "message": "Event tracked successfully"
    }
    ```

---

## 2. Send Message APIs
All message APIs use the endpoint `/message/` but differ by `type` in the payload. Note: You must use `Template` messages to initiate a conversation outside the 24-hour window.

**Endpoint**: `https://api.interakt.ai/v1/public/message/`
**Method**: `POST`

### 2.1 Send Image Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Image",
        "data": {
            "message": "Here is your invoice",
            "mediaUrl": "https://example.com/invoice.jpg"
        }
    }
    ```

### 2.2 Send Document Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Document",
        "data": {
            "message": "Project Report",
            "mediaUrl": "https://example.com/report.pdf",
            "fileName": "Report_2024.pdf"
        }
    }
    ```

### 2.3 Send Video Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Video",
        "data": {
            "message": "Check out this demo",
            "mediaUrl": "https://example.com/demo.mp4",
            "fileName": "DemoVideo"
        }
    }
    ```

### 2.4 Send Audio Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Audio",
        "data": {
            "message": "This is a test",
            "mediaUrl": "https://example.com/audio.mp3",
            "fileName": "TestAudio"
        }
    }
    ```

### 2.5 Send Sticker Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Sticker",
        "data": {
            "mediaUrl": "https://example.com/sticker.webp"
        }
    }
    ```

### 2.6 Send Interactive Button Message
Sends a message with up to 3 quick reply buttons.
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "InteractiveButton",
        "data": {
            "body": {
                "text": "Would you like to confirm the order?"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "btn_yes",
                            "title": "Yes"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "btn_no",
                            "title": "No"
                        }
                    }
                ]
            }
        }
    }
    ```

### 2.7 Send Interactive List Message
Sends a message with a menu of up to 10 options.
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "InteractiveList",
        "data": {
            "body": {
                "text": "Select a department"
            },
            "action": {
                "button": "View Options",
                "sections": [
                    {
                        "title": "Support",
                        "rows": [
                            {
                                "id": "opt_billing",
                                "title": "Billing",
                                "description": "Issues with payments"
                            },
                            {
                                "id": "opt_tech",
                                "title": "Technical",
                                "description": "App or website issues"
                            }
                        ]
                    }
                ]
            }
        }
    }
    ```

---

## 3. Template APIs
Used for initiating conversations.
**Endpoint**: `https://api.interakt.ai/v1/public/message/`
**Method**: `POST`

### 3.1 Send Text Template
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Template",
        "template": {
            "name": "welcome_message",
            "languageCode": "en",
            "bodyValues": [
                "John" 
            ]
        }
    }
    ```
    *   *Note: `bodyValues` replaces `{{1}}`, `{{2}}` variables in the template body.*

### 3.2 Send Media Template (Image/Video/Doc Header)
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Template",
        "template": {
            "name": "invoice_delivery",
            "languageCode": "en",
            "headerValues": [
                "https://example.com/invoice.pdf"
            ],
            "bodyValues": [
                "ORD-555"
            ]
        }
    }
    ```

### 3.3 Send Authentication Template
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9028883545",
        "type": "Template",
        "template": {
            "name": "auth_one_tap_code",
            "languageCode": "en",
            "bodyValues": ["1234"],
            "buttonValues": { "0": ["1234"] }
        }
    }
    ```

### 3.4 Send Template with Dynamic CTA
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Template",
        "template": {
            "name": "dynamic_cta_template",
            "languageCode": "en",
            "bodyValues": ["John"],
            "buttonValues": { "1": ["https://dynamic-link.com"] }
        }
    }
    ```

### 3.5 Send Carousel Template
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Template",
        "template": {
            "name": "product_carousel",
            "languageCode": "en",
            "bodyValues": ["Summer Sale"],
            "carouselCards": [
                {
                    "headerValues": ["https://example.com/item1.jpg"],
                    "bodyValues": ["Item 1"],
                    "buttonValues": { "1": ["item_1_id"] }
                }
            ]
        }
    }
    ```

### 3.6 Send Order Status Template
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Template",
        "template": {
            "name": "order_status_update",
            "languageCode": "en",
            "bodyValues": ["$200"],
            "order_status": {
                "reference_id": "ref_123",
                "order": {
                    "status": "shipped",
                    "description": "Your order has been shipped"
                }
            }
        }
    }
    ```

---

## 4. Create Template APIs
**Endpoint**: `https://api.interakt.ai/v1/public/track/templates/`
**Method**: `POST`

### 4.1 Create Text Header Template
*   **Payload**:
    ```json
    {
        "display_name": "WELCOME_OFFER",
        "language": "English",
        "category": "Marketing",
        "header_format": "TEXT",
        "header_text": "Welcome Offer",
        "body": "Hi {{1}}, get 10% off on your first order.",
        "body_text": ["User"],
        "footer": "Team Interakt"
    }
    ```

### 4.2 Create Media Header Template (Image)
*   **Payload**:
    ```json
    {
        "display_name": "IMAGE_OFFER",
        "language": "English",
        "category": "Marketing",
        "header_format": "IMAGE",
        "header_handle": ["<file_handle_from_upload>"],
        "header_handle_file_url": "https://example.com/image.jpg",
        "header_handle_file_name": "offer.jpg",
        "body": "Check out this exclusive offer!",
        "footer": "Limited Time"
    }
    ```

### 4.3 Create Carousel Template
*   **Payload**:
    ```json
    {
        "display_name": "PRODUCT_CAROUSEL",
        "language": "English",
        "category": "Marketing",
        "body": "Check out our new arrivals",
        "carousel_cards": [
            {
                "card_index": 0,
                "header_format": "IMAGE",
                "header_handle": ["<file_handle>"],
                "cardTitle": "Product 1",
                "body": "Description for Product 1",
                "buttons": [
                    { "type": "QUICK_REPLY", "text": "View Details" }
                ]
            }
        ]
    }
    ```

### 4.4 Get All Templates
Retrieve all templates for the organization.
*   **Method**: `GET`
*   **Endpoint**: `https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20`

---

## 5. Campaign APIs
(Refactored numbering from previous section)

### 5.1 Create Campaign
Trigger a campaign via API for a specific segment or logic.
*   **Method**: `POST`
*   **Endpoint**: `https://api.interakt.ai/v1/public/create-campaign/`
*   **Payload**:
    ```json
    {
        "campaign_name": "Diwali Sale 2025",
        "campaign_type": "PublicAPI",
        "template_name": "diwali_offer",
        "language_code": "en"
    }
    ```
*   **Response**:
    ```json
    {
        "result": true,
        "message": "Api Campaign Created created successfully",
        "data": {
            "campaignId": "4fdff884-c388-4c1e-aea6-1890222dbc2e",
            "name": "Diwali Sale 2025",
            "type": "PublicAPI"
        }
    }
    ```

---

## 6. Customer APIs

### 6.1 Get Users
Retrieve users based on filters.
*   **Method**: `POST`
*   **Endpoint**: `https://api.interakt.ai/v1/public/apis/users/?offset=0&limit=100`
*   **Payload**:
    ```json
    {
        "filters": [
            {
                "trait": "created_at_utc",
                "op": "gt",
                "val": "2024-01-01T00:00:00.000Z"
            }
        ]
    }
    ```
*   **Response**:
    ```json
    {
        "result": true,
        "message": "Customers",
        "data": {
            "total_customers": 1,
            "customers": [
                {
                    "id": "user-id-1",
                    "traits": { ... }
                }
            ]
        }
    }
    ```

---

## 7. RCS APIs
**Endpoint**: `https://api.interakt.ai/v1/public/rcs/message/`
**Method**: `POST`

### 7.1 Send RCS Text Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "Text",
        "message": {
            "plainText": "Hello via RCS!"
        }
    }
    ```

### 7.2 Send RCS Carousel Message
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "CAROUSEL",
        "message": {
            "richCardDetails": {
                "carousel": {
                    "cardWidth": "MEDIUM_WIDTH",
                    "contents": [
                        {
                            "cardTitle": "Product 1",
                            "cardDescription": "Description here",
                            "cardMedia": {
                                "contentInfo": { "fileUrl": "https://example.com/img1.jpg" },
                                "mediaHeight": "MEDIUM"
                            },
                        "suggestions": []
                        }
                    ]
                }
            }
        }
    }
    ```

### 7.3 Send RCS Rich Card (Standalone)
*   **Payload**:
    ```json
    {
        "countryCode": "+91",
        "phoneNumber": "9999999999",
        "type": "STANDALONE_CAROUSEL",
        "message": {
            "richCardDetails": {
                "standalone": {
                    "cardOrientation": "VERTICAL",
                    "content": {
                        "cardTitle": "Welcome Card",
                        "cardDescription": "Welcome to our service",
                        "cardMedia": {
                            "mediaHeight": "TALL",
                            "contentInfo": { "fileUrl": "https://example.com/welcome.jpg" }
                        },
                        "suggestions": []
                    }
                }
            }
        }
    }
    ```

---

## 8. Chat Assignment

### 8.1 Assign Chat
Assigns a user's chat to an agent.
*   **Method**: `POST`
*   **Endpoint**: `https://api.interakt.ai/v1/public/chat/assign/`
*   **Payload**:
    ```json
    {
        "userId": "user-unique-id",
        "agentId": "agent-id-123" 
    }
    ```

---

## 9. Callbacks & Webhooks
Configure these URLs in your Interakt settings to receive real-time updates.

### 9.1 Message Received Webhook
Triggered when a user sends a message to the business.
*   **Payload Example**:
    ```json
    {
        "userPhoneNumber": "+919999999999",
        "botId": "bot_123",
        "entityType": "USER_MESSAGE",
        "entity": {
            "messageId": "msg_id_123",
            "sendTime": "2024-01-01T10:00:00Z",
            "text": "Hello, I need help",
            "type": "text",
            "mediaUrl": null
        }
    }
    ```

### 9.2 Message Status Webhook
Triggered when a message status changes (Sent, Delivered, Read, Failed).
*   **Payload Example**:
    ```json
    {
        "userPhoneNumber": "+919999999999",
        "botId": "bot_123",
        "entityType": "USER_EVENT",
        "entity": {
            "eventType": "MESSAGE_READ",
            "messageId": "msg_id_123",
            "sendTime": "2024-01-01T10:05:00Z",
            "eventId": "evt_123"
        }
    }
    ```

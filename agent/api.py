from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from bot import graph,chat,get_current_datetime_response
from langchain_core.messages import HumanMessage
import asyncio

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://medimitra.ms-sat.xyz"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_sys = """You are a healthcare assistant deployed on a website named "MediMitra".
Your role is:
1. Assist the users with there health related issues, for this you can also access a database to get some information
   on diseases to help the user properly.
2. Talk to the user like a professional but in a soft and cheering tone since the user is ill and he needs support.
3. If the user wants you have to book the user's appointment with the doctor.
4. "You must call only one tool at a time"

While booking user's appointment with a doctor follow this type of thinking:
User input: Tell me about the doctors available in my area.
Assistant: Calls a tool like api_retriver to get the Hospitals.
Tool: Hospitals list near the user.
Assistant: Calls a tool to get the doctors from the hospitals.
Tools: Gives the doctors available
Assistant: Tell the user about the doctors and there time slots and asks the user for which doctor to book and confirm
about booking.
User: Says to book some of the doctors
Assistant: Calls a tool to book appointment of the doctor.

If you want to know about some type of disease or symptom related data use the disease info tool and also web search

"""
dynamic_sys= f"""{get_current_datetime_response()},
Location of the user=> lat=16.27939453125 & lon=80.58837890625 \n"""


def stream_chat(message,id):
    input_ = message
    id_ = id
    
    global static_sys
    dynamic_sys= f"""{get_current_datetime_response()},
    Location of the user=> lat=16.27939453125 & lon=80.58837890625 \n"""

    dynamic = dynamic_sys + " User id: " + id_
    state = chat(static_system=static_sys,
                 dynamic_system=dynamic,
                 summary="",
                 messages=[HumanMessage(input_)])
    for chunk, meta in graph.stream(input=state,
                                config={"configurable": {"thread_id": id_}},
                                stream_mode="messages"
                                ):
        if chunk.content and meta["langgraph_node"] == "chat_node":
            yield f"data: {chunk.content}\n\n"

class request_(BaseModel):
    message: str
    id: str
    
@app.post("/agent/chat_message")
def stream(request: request_):
    message = request.message
    id = request.id
    
    return StreamingResponse(stream_chat(message,id),media_type="text/event-stream")
    
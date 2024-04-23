import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./component/Login";
import "./App.css";

const App = () => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setCurrentUser(localStorage.getItem("username"));
    }
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);
  const fetchTickets = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tickets");
      console.log(response.data);
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  const generateTicket = async () => {
    console.log("generating ticket");
    if (!subject || !description || !currentUser) return;
    try {
      const response = await axios.post("http://localhost:5000/api/tickets", {
        subject,
        description,
        user: currentUser,
      });
      console.log(response);
      alert(
        `Ticket generated successfully with number: ${response.data.ticket.ticketNumber}`
      );
      setSubject("");
      setDescription("");
      fetchTickets();
    } catch (error) {
      console.error("Failed to generate ticket:", error);
    }
  };
  //Login
  const login = async (username, password) => {
    try {
      const userData = { username, password };
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      console.log(data);
      if (data.success) {
        localStorage.setItem("username", data.username);
        setCurrentUser(data.username);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to login:", error);
      alert("Invalid username or password");
    }
  };

  const handleTicketSelect = (ticketNumber) => {
    setSelectedTicket(ticketNumber);
  };

  const logOut = () => {
    localStorage.removeItem("username");
    setCurrentUser(null);
  };

  const handleReply = async (ticketNumber) => {
    if (!reply) return;
    console.log(reply);
    try {
      const replyData = { user: currentUser, reply, ticketNumber };
      const response = await fetch("http://localhost:5000/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyData),
      });
      const data = await response.json();
      fetchTickets();
    } catch (error) {
      console.error("Failed to login:", error);
      alert("Invalid username or password");
    }
  };
  return (
    <div className="app-container">
      {currentUser ? (
        <>
          <button onClick={logOut} className="logout-button">
            Logout
          </button>
          <h1 className="title">Ticket System</h1>
          {currentUser === "admin" && (
            <>
              <h2 className="generate-ticket-title">Generate Ticket</h2>
              <label className="subject-label">Subject:</label>
              <input
                className="subject-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <br />
              <label className="description-label">Description:</label>
              <textarea
                className="description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <br />
              <button onClick={generateTicket} className="generate-button">
                Generate Ticket
              </button>
              <h2 className="tickets-title">Tickets</h2>
            </>
          )}
          <ul className="tickets-list">
            {tickets.map((ticket) => (
              <>
                <li
                  key={ticket.ticketNumber}
                  onClick={() => handleTicketSelect(ticket.ticketNumber)}
                  className={`ticket-item ${
                    selectedTicket === ticket.ticketNumber ? "selected" : ""
                  }`}
                  data-ticket-number={ticket.ticketNumber}
                >
                  <div className="ticket-header">
                    <span className="ticket-subject">Subject :{ ticket.subject}</span>
                  </div>
                  <div className="ticket-description">Description : { ticket.description}</div>
                </li>
                {ticket.replies.length > 0 && (
                  <ul className="replies-list">
                    {ticket.replies.map((reply, index) => {
                      return (
                        <li key={index} className="reply-item">
                          {reply}
                        </li>
                      );
                    })}
                  </ul>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleReply(ticket.ticketNumber);
                  }}
                  className="reply-form"
                >
                  <input
                    onChange={(e) => {
                      e.preventDefault();
                      setReply(e.target.value);
                     
                    }}
                    placeholder={`Reply to ${ticket.ticketNumber}`}
                    className="reply-input"
                  ></input>
                  <button type="submit" className="reply-button">
                    Reply
                  </button>
                </form>
              </>
            ))}
          </ul>
        </>
      ) : (
        <Login login={login} />
      )}
    </div>
  );
};

export default App;

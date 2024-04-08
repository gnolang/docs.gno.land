import React, { useState } from "react";

export default function Feedback() {
  const [formData, setFormData] = useState({ email: "", message: "" });
  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isOpen, setIsOpen] = useState(false);
  const toggle = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  //TODO: send data

  return (
    <div className="feedback">
      <div className="footer__title">Was this documentation helpful?</div>
      {isOpen ? (
        <form className="feedback__form">
          <button className="feedback__inner-btn feedback__close" aria-label="Close" onClick={toggle}>
            ✕
          </button>
          <div>
            <div className="feedback__field">
              <label for="feedback-email">Email</label>
              <input type="email" name="email" id="feedback-email" placeholder="albert@email.com" value={formData.name} onChange={handleChange} />
            </div>
            <div className="feedback__field">
              <label for="feedback-review">Review</label>
              <textarea type="text" name="message" id="feedback-review" placeholder="Your review here" rows="6" value={formData.message} onChange={handleChange} />
            </div>
            <button className="feedback__inner-btn feedback__send">Send Feedback</button>
          </div>
        </form>
      ) : (
        <button className="feedback__btn" onClick={toggle}>
          Give a Feedback
        </button>
      )}
    </div>
  );
}

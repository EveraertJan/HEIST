import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is Ontastbaar?",
    answer: "Ontastbaar is a curated platform for renting immersive art experiences designed for homes, offices, and events. We transform spaces through carefully selected digital art installations that spark conversations and create memorable environments."
  },
  {
    question: "How do I rent an artwork?",
    answer: "Browse our gallery, select an artwork that interests you, and click 'Rent Artwork'. You'll need to provide delivery address and contact information. Your request will be reviewed by our team, and once approved, we'll arrange delivery and setup."
  },
  {
    question: "What types of art experiences do you offer?",
    answer: "We offer various mediums including digital installations, projection art, interactive pieces, and immersive environments. Each experience is designed to transform spaces and create engaging atmospheres for both personal and professional settings."
  },
  {
    question: "How long can I rent an artwork?",
    answer: "The maximum rental period is 1 month. Rental durations can be discussed based on your specific needs, especially for corporate events or longer exhibitions."
  },
  {
    question: "Do you provide installation and setup?",
    answer: "Yes, we provide all necessary equipment and setup guidance for a seamless installation. Our team ensures that each artwork is properly installed and ready for your experience."
  },
  {
    question: "Can I rent artworks for corporate events?",
    answer: "Absolutely! We specialize in creating unforgettable corporate experiences. Our installations serve as powerful conversation catalysts for conferences, offices, showrooms, and exclusive events. Contact us at events@Ontastbaar.gallery for custom curation."
  },
  {
    question: "How do I check if an artwork is available?",
    answer: "Each artwork in our gallery shows its availability status. If an artwork is currently rented out, it will be marked as unavailable. You can still submit a request, and we'll notify you when it becomes available."
  },
  {
    question: "What happens after I submit a rental request?",
    answer: "Your request goes through an approval process. You'll receive updates on the status: requested (pending), approved, finalized (completed), or rejected. You can track all your requests in the 'My Rentals' section."
  },
  {
    question: "How do I create an account?",
    answer: "Click 'Request Membership' on the login page and fill in your details. Once registered, you can browse artworks, submit rental requests, and manage your profile information."
  },
  {
    question: "What are the delivery requirements?",
    answer: "You'll need to provide a complete delivery address and phone number when requesting a rental. Our team will coordinate delivery timing and any specific setup requirements for your space."
  },
  {
    question: "Can I search or filter artworks?",
    answer: "Yes, our gallery allows you to search by artwork title or artist name, and filter by different mediums. This helps you find the perfect experience for your space and preferences."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take data security seriously. All passwords are hashed before storage, communications are encrypted via HTTPS, and we comply with GDPR regulations. Please refer to our Privacy Policy and GDPR pages for more detailed information."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="container">
      <div className="row">
        <div className="ten columns offset-by-one">
          <h2>Frequently Asked Questions</h2>
          <p style={{ marginBottom: '30px' }}>
            Find answers to common questions about Ontastbaar. Can't find what you're looking for?
            Feel free to <a href="mailto:events@Ontastbaar.gallery">contact us</a>.
          </p>

          <div>
            {faqData.map((faq, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <div
                  onClick={() => toggleFAQ(index)}
                  style={{
                    padding: '15px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{faq.question}</span>
                  <span style={{ fontSize: '18px' }}>
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
                {openIndex === index && (
                  <div style={{
                    padding: '15px',
                    borderTop: '1px solid #ddd',
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

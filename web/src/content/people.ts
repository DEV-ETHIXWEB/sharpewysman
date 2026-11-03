import type { TeamMember, Testimonial } from "../lib/types";

/** Verbatim from the current sharpewysman.com testimonials. */
export const testimonials: Testimonial[] = [
  {
    id: "russ-wilson",
    quote:
      "Sukhjit has recruited many first class candidates for Johnsen Archer. He takes the time to understand our needs and only sends candidates that he has pre-qualified for the position. The service we have received has been outstanding and I would not hesitate to recommend him for your recruitment project.",
    name: "Russ Wilson",
    role: "Owner",
    company: "Johnsen Archer",
    audience: "client",
  },
  {
    id: "nolan-clark",
    quote:
      "It has been an absolute pleasure working with Sukhjit. Always professional and never pushy. He takes the time to understand the situation and provides valuable insight based on his deep industry experience. I would highly recommend him to anyone looking to make a move or company seeking to hire.",
    name: "Nolan Clark",
    role: "Partner",
    company: "Rise CPA",
    audience: "client",
  },
  {
    id: "ryan-calder",
    quote:
      "Sukhjit has been a great resource to work with. He is very professional and understands appropriate discretion based on whatever your unique situation might be.",
    name: "Ryan Calder",
    role: "Partner",
    company: "MNP",
    audience: "client",
  },
  {
    id: "ben-richet",
    quote:
      "Sukhjit was absolutely great to work with and a true professional. He really took the time to invest in me as a candidate and the company to ensure that fit was precise. I will highly recommend Sukhjit to any job seekers looking for their next role or companies looking to make their next hire.",
    name: "Ben Richet",
    role: "Director of Finance",
    company: "Renewal by Andersen",
    audience: "candidate",
  },
  {
    id: "graeme-cocke",
    quote:
      "Sukhjit was a pleasure to work with. He identified multiple opportunities for me, researched the companies, coached me on interview tactics and answers to the more difficult questions, kept me informed of the progress of each opportunity and my place in that progress, and ultimately was able to help me procure three offers. I would definitely work with Sukhjit again, should the need arise.",
    name: "Graeme Cocke",
    role: "Partner",
    company: "Baker Tilly WM",
    audience: "candidate",
  },
  {
    id: "jonathan-mackey",
    quote:
      "Sukhjit was a great help throughout this process. His knowledge and experience were invaluable, so I would definitely recommend Sukhjit to people who are either actively looking for a new position, or simply looking to understand and explore available opportunities.",
    name: "Jonathan Mackey",
    role: "CFO",
    company: "Houweling Nurseries",
    audience: "candidate",
  },
];

export const team: TeamMember[] = [
  {
    slug: "sukhjit-singh-lalli",
    name: "Sukhjit Singh Lalli",
    role: "Founder & Partner",
    phone: "604-779-5251",
    linkedin: "https://www.linkedin.com/in/sukhjitlalli/",
    image: "/images/team-sukhjit-lalli.jpg",
    credentials: ["Chartered Accountant (qualified with PwC, London)", "Formerly EY and British Aerospace"],
    bio: [
      "Sukhjit qualified as a Chartered Accountant with PwC in London, England. After a very successful career in accounting, including tenure with EY and British Aerospace, he moved into accounting recruitment.",
      "He saw a need for more integrity and expertise in the recruitment industry, and in 2008 founded Sharpe Wysman to deliver on that vision. He has led the firm for 18 years, recruiting mid-level to leadership roles in public practice and industry.",
    ],
  },
  {
    slug: "sonia",
    name: "Sonia",
    role: "Senior Recruiter",
    phone: "604-670-5932",
    image: "/images/team-sonia.jpg",
    bio: [
      "Sonia partners with employers and candidates across Greater Vancouver, bringing the same careful, never-pushy approach that defines Sharpe Wysman.",
    ],
  },
];

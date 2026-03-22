import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import { createEnquiry } from "../services/enquiryService";
import { useToast } from "../hooks/useToast";
import Footer from "../components/Footer";

function HomePage() {
  const { showToast } = useToast();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    program: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const galleryImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
  ];

  const programOptions = [
    { value: "", label: "Select a program (optional)" },
    { value: "1", label: "Group Training" },
    { value: "2", label: "1-to-1 Coaching" },
    { value: "3", label: "Goalkeeper Training" },
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        program: formData.program || null,
      };

      await createEnquiry(payload);

      showToast("Enquiry sent successfully.", "success");

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        program: "",
      });
    } catch (err) {
      const data = err.response?.data;

      if (data) {
        const firstError =
          data.name?.[0] ||
          data.email?.[0] ||
          data.phone?.[0] ||
          data.message?.[0] ||
          data.program?.[0] ||
          data.detail ||
          "Failed to send enquiry. Please try again.";

        showToast(firstError, "error");
      } else {
        showToast("Failed to send enquiry. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="app-shell">
      <Navbar mode="overlay" />

      <section
        className="relative min-h-[88vh] overflow-hidden px-6 pt-20 pb-28 lg:px-10 lg:pt-28 lg:pb-36"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(17, 17, 17, 0.72) 0%, rgba(17, 17, 17, 0.56) 38%, rgba(17, 17, 17, 0.28) 100%), url('https://i.pinimg.com/1200x/81/d9/b5/81d9b59b6a53801b9c94bbb5df584cc2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-app-bg" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-primary-soft">
              Elite Football Development
            </p>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Train smarter, improve faster, and perform with confidence.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Professional football coaching designed to improve technique,
              movement, decision-making, and match confidence for every player.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg">Join Academy</Button>
              </Link>

              <Link to="/training-sessions">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/15 hover:text-white"
                >
                  View Training Sessions
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-white/75">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                Structured coaching
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                Flexible bookings
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                Player-first development
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-14 px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { value: "100+", label: "Training Sessions" },
            { value: "Expert", label: "Coach-Led Development" },
            { value: "All Levels", label: "Youth to Competitive Players" },
            { value: "Flexible", label: "Easy Online Booking" },
          ].map((item) => (
            <Card key={item.label} className="h-full">
              <CardContent className="p-5">
                <h3 className="text-2xl font-extrabold tracking-tight text-app-text">
                  {item.value}
                </h3>
                <p className="mt-2 text-sm leading-6 text-app-text-soft">
                  {item.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pt-24 pb-16 lg:px-10 lg:pt-28 lg:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Programs
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Training designed around real player development
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              Choose from structured sessions that target technical growth,
              physical sharpness, and match performance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Group Training",
                description:
                  "Improve technical ability, awareness, and decision-making in high-quality academy group sessions.",
              },
              {
                title: "1-to-1 Coaching",
                description:
                  "Focused individual coaching built around your strengths, weaknesses, and performance goals.",
              },
              {
                title: "Goalkeeper Training",
                description:
                  "Specialist goalkeeper sessions covering handling, reactions, positioning, footwork, and confidence.",
              },
            ].map((program) => (
              <Card key={program.title} className="h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold tracking-tight text-app-text">
                    {program.title}
                  </h3>
                  <p className="mt-4 leading-7 text-app-text-soft">
                    {program.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-24 bg-app-surface py-16 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              About Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Building better players through structured football coaching
            </h2>
            <p className="mt-5 leading-8 text-app-text-soft">
              Football Academy is focused on developing players through
              professional coaching, structured training environments, and
              consistent football education.
            </p>
            <p className="mt-4 leading-8 text-app-text-soft">
              We help players improve technical ability, movement, match
              awareness, confidence, and discipline through sessions designed
              for long-term progress rather than short-term results.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Professional coaching approach",
                "Player-first development",
                "Structured session planning",
                "Supportive learning environment",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-app-border bg-app-card p-4 text-sm font-medium text-app-text-soft shadow-[var(--shadow-soft)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-app-border bg-app-card shadow-[var(--shadow-premium)]">
            <img
              src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80"
              alt="Football coaching session"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="scroll-mt-24 px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Gallery
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              A look inside our training environment
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              See the intensity, focus, and professionalism behind our football
              development sessions.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.5rem] border border-app-border bg-app-card shadow-[var(--shadow-soft)]"
              >
                <img
                  src={image}
                  alt={`Football Academy gallery ${index + 1}`}
                  className="h-72 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-app-surface py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Why Choose Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              More than training sessions
            </h2>
            <p className="mt-4 text-lg leading-8 text-app-text-soft">
              We help players build the habits, discipline, and confidence
              needed to perform better in real matches.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Structured Coaching",
                description:
                  "Sessions are planned with clear outcomes instead of random drills.",
              },
              {
                title: "Player-Focused Development",
                description:
                  "Training is designed to improve technical ability and game understanding.",
              },
              {
                title: "Easy Booking Experience",
                description:
                  "Browse sessions, reserve your place, and manage bookings easily.",
              },
              {
                title: "Long-Term Progress",
                description:
                  "We focus on continuous development, not just one good session.",
              },
            ].map((item) => (
              <Card key={item.title} className="h-full">
                <CardContent className="p-7">
                  <h3 className="text-xl font-bold tracking-tight text-app-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-7 text-app-text-soft">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="scroll-mt-24 px-6 py-16 lg:px-10 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
              Contact Us
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
              Enquire about training, programs, or player development
            </h2>
            <p className="mt-5 leading-8 text-app-text-soft">
              Whether you are looking for academy training, individual coaching,
              or more information about available programs, send us a message
              and we will get back to you.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Phone</p>
                <p className="mt-2 font-semibold text-app-text">
                  +977-98XXXXXXXX
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Email</p>
                <p className="mt-2 font-semibold text-app-text">
                  academy@example.com
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-app-border bg-app-card p-5 shadow-[var(--shadow-soft)]">
                <p className="text-sm text-app-text-muted">Location</p>
                <p className="mt-2 font-semibold text-app-text">
                  Your academy training location
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold tracking-tight text-app-text">
                Send an enquiry
              </h3>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />

                <Select
                  label="Interested Program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  options={programOptions}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-app-text">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us what you are looking for..."
                    className="w-full rounded-2xl border border-app-border bg-app-card px-4 py-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-brand-primary"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full"
                >
                  Send Enquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-app-border bg-app-card p-10 text-center shadow-[var(--shadow-premium)]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">
            Start Today
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
            Ready to take your game to the next level?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-app-text-soft">
            Join the academy, explore available sessions, and begin your player
            development journey.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Register Now</Button>
            </Link>

            <Link to="/training-sessions">
              <Button variant="outline" size="lg">
                Browse Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
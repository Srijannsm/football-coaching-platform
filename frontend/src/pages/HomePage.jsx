import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Card, CardContent } from "../components/ui/Card";
import { createEnquiry } from "../services/enquiryService";
import { useToast } from "../context/ToastContext";

function HomePage() {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    program: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const galleryImages = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
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
      setFormError("");
      setFormSuccess("");

      const payload = {
        ...formData,
        program: formData.program || null,
      };

      await createEnquiry(payload);

      setFormSuccess("Thank you. We have received your enquiry.");
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

        setFormError(firstError);
        showToast(firstError, "error");
      } else {
        setFormError("Failed to send enquiry. Please try again.");
        showToast("Failed to send enquiry. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <Navbar />

      <section
        className="relative flex min-h-[90vh] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/65" />

        <div className="relative mx-auto flex w-full max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Elite Football Development
            </p>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white md:text-6xl">
              Train Smarter. Play Better. Perform With Confidence.
            </h1>

            <p className="mb-8 max-w-2xl text-lg leading-8 text-neutral-200">
              Professional football coaching designed to improve technique,
              movement, decision-making, and match confidence for every player.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                  Join Academy
                </Button>
              </Link>

              <Link to="/training-sessions">
                <Button
                  variant="outline"
                  className="rounded-full border-white/70 bg-transparent text-white hover:border-yellow-400 hover:text-yellow-400"
                >
                  View Training Sessions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-12 px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { value: "100+", label: "Training Sessions" },
            { value: "Expert", label: "Coach-Led Development" },
            { value: "All Levels", label: "Youth to Competitive Players" },
            { value: "Flexible", label: "Easy Online Booking" },
          ].map((item) => (
            <Card key={item.label} className="bg-white text-black shadow-xl">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-3xl font-extrabold">{item.value}</h3>
                <p className="text-sm text-neutral-600">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Programs
          </p>
          <h2 className="mb-4 text-4xl font-extrabold text-white">
            Training Designed Around Real Player Development
          </h2>
          <p className="text-lg leading-8 text-neutral-300">
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
            <Card
              key={program.title}
              className="border-white/10 bg-white/5 backdrop-blur"
            >
              <CardContent className="p-8">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  {program.title}
                </h3>
                <p className="leading-7 text-neutral-300">
                  {program.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        id="about"
        className="bg-black/60 px-6 py-24 lg:px-10 scroll-mt-24"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              About Us
            </p>
            <h2 className="mb-5 text-4xl font-extrabold text-white">
              Building Better Players Through Structured Football Coaching
            </h2>
            <p className="mb-5 leading-8 text-neutral-300">
              Football Academy is focused on developing players through
              professional coaching, structured training environments, and
              consistent football education.
            </p>
            <p className="mb-8 leading-8 text-neutral-300">
              We help players improve technical ability, movement, match
              awareness, confidence, and discipline through sessions designed
              for long-term progress rather than short-term results.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Professional coaching approach",
                "Player-first development",
                "Structured session planning",
                "Supportive learning environment",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-neutral-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
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
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 scroll-mt-24"
      >
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Gallery
          </p>
          <h2 className="mb-4 text-4xl font-extrabold text-white">
            A Look Inside Our Training Environment
          </h2>
          <p className="text-lg leading-8 text-neutral-300">
            See the intensity, focus, and professionalism behind our football
            development sessions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-white/10 bg-neutral-900"
            >
              <img
                src={image}
                alt={`Football Academy gallery ${index + 1}`}
                className="h-72 w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black/60 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Why Choose Us
            </p>
            <h2 className="mb-4 text-4xl font-extrabold text-white">
              More Than Training Sessions
            </h2>
            <p className="text-lg leading-8 text-neutral-300">
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
              <Card key={item.title} className="border-white/10 bg-neutral-900">
                <CardContent className="p-7">
                  <h3 className="mb-3 text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="leading-7 text-neutral-300">
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
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 scroll-mt-24"
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Contact Us
            </p>
            <h2 className="mb-5 text-4xl font-extrabold text-white">
              Enquire About Training, Programs, or Player Development
            </h2>
            <p className="mb-6 leading-8 text-neutral-300">
              Whether you are looking for academy training, individual coaching,
              or more information about available programs, send us a message
              and we will get back to you.
            </p>

            <div className="space-y-4 text-neutral-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Phone</p>
                <p className="mt-2 font-semibold text-white">+977-98XXXXXXXX</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Email</p>
                <p className="mt-2 font-semibold text-white">
                  academy@example.com
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-neutral-400">Location</p>
                <p className="mt-2 font-semibold text-white">
                  Your academy training location
                </p>
              </div>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-8">
              <h3 className="mb-6 text-2xl font-bold text-white">
                Send an Enquiry
              </h3>

              {formError && (
                <div className="mb-4">
                  <Alert variant="error">{formError}</Alert>
                </div>
              )}

              {formSuccess && (
                <div className="mb-4">
                  <Alert variant="success">{formSuccess}</Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  <label className="mb-2 block text-sm font-medium text-white">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Tell us what you are looking for..."
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-yellow-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Send Enquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-gradient-to-b from-neutral-950 to-stone-900 px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-10 text-center text-black shadow-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-yellow-600">
            Start Today
          </p>
          <h2 className="mb-4 text-4xl font-extrabold">
            Ready to Take Your Game to the Next Level?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-neutral-600">
            Join the academy, explore available sessions, and begin your player
            development journey.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300">
                Register Now
              </Button>
            </Link>

            <Link to="/training-sessions">
              <Button
                variant="outline"
                className="rounded-full border-black bg-transparent text-black hover:bg-black hover:text-white"
              >
                Browse Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <h3 className="mb-3 text-2xl font-extrabold text-white">
            Football Academy
          </h3>
          <p className="mx-auto mb-6 max-w-2xl leading-7 text-neutral-400">
            Professional football coaching for players who want to improve
            technique, confidence, and performance.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-yellow-400">
            <a href="/#about">About Us</a>
            <a href="/#gallery">Gallery</a>
            <a href="/#contact">Contact</a>
            <Link to="/training-sessions">Sessions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
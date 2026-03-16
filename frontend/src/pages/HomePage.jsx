import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

function HomePage() {
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
            <Link to="/">Home</Link>
            <Link to="/training-sessions">Sessions</Link>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
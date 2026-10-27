const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");

const mongoUri = process.env.MONGODB_CONNECTION_LINK || "mongodb://127.0.0.1:27017/imovies";

const generateTickets = (theatre) => {
  const tickets = {};
  const tiers = [
    { name: "balcony", rows: theatre.balconySeats.rows, price: theatre.balconySeatPrice, count: theatre.balconySeats.seatsPerRow },
    { name: "middle", rows: theatre.middleSeats.rows, price: theatre.middleSeatPrice, count: theatre.middleSeats.seatsPerRow },
    { name: "lower", rows: theatre.lowerSeats.rows, price: theatre.lowerSeatPrice, count: theatre.lowerSeats.seatsPerRow },
  ];

  for (const t of tiers) {
    for (const r of t.rows) {
      for (let i = 1; i <= t.count; i++) {
        const id = `${r}${i}`;
        tickets[id] = {
          seatId: id,
          row: r,
          number: i,
          tier: t.name,
          price: t.price,
          isBooked: false,
          bookedBy: null,
        };
      }
    }
  }
  return tickets;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed Admin
    const adminEmail = "admin@imovies.com";
    const adminPass = await bcrypt.hash("Admin@12345", 10);
    await Admin.findOneAndUpdate(
      { email: adminEmail },
      { username: "iMoviesAdmin", email: adminEmail, password: adminPass, role: "admin" },
      { upsert: true, new: true }
    );
    await User.findOneAndUpdate(
      { email: adminEmail },
      { username: "iMoviesAdmin", email: adminEmail, password: adminPass, role: "admin" },
      { upsert: true, new: true }
    );
    console.log("✅ Admin seeded (admin@imovies.com / Admin@12345)");

    // 2. Seed Test User
    const userEmail = "user@imovies.com";
    const userPass = await bcrypt.hash("User@12345", 10);
    await User.findOneAndUpdate(
      { email: userEmail },
      { username: "JohnDoe", email: userEmail, password: userPass, role: "user" },
      { upsert: true, new: true }
    );
    console.log("✅ Test User seeded (user@imovies.com / User@12345)");

    // 3. Seed Theatres
    const theatresData = [
      {
        theatreName: "PVR ICON: Gold Class",
        theatreId: "THEATRE_01",
        location: "Mumbai, Bandra West",
        adminName: "iMoviesAdmin",
        balconySeatPrice: 350,
        middleSeatPrice: 250,
        lowerSeatPrice: 150,
        balconySeats: { rows: ["A", "B"], seatsPerRow: 10 },
        middleSeats: { rows: ["C", "D", "E"], seatsPerRow: 12 },
        lowerSeats: { rows: ["F", "G"], seatsPerRow: 14 },
      },
      {
        theatreName: "INOX Megaplex",
        theatreId: "THEATRE_02",
        location: "Delhi NCR, Connaught Place",
        adminName: "iMoviesAdmin",
        balconySeatPrice: 320,
        middleSeatPrice: 220,
        lowerSeatPrice: 140,
        balconySeats: { rows: ["A", "B"], seatsPerRow: 10 },
        middleSeats: { rows: ["C", "D", "E"], seatsPerRow: 12 },
        lowerSeats: { rows: ["F", "G"], seatsPerRow: 14 },
      },
      {
        theatreName: "Cinepolis: VIP",
        theatreId: "THEATRE_03",
        location: "Bengaluru, Whitefield",
        adminName: "iMoviesAdmin",
        balconySeatPrice: 300,
        middleSeatPrice: 200,
        lowerSeatPrice: 120,
        balconySeats: { rows: ["A", "B"], seatsPerRow: 10 },
        middleSeats: { rows: ["C", "D"], seatsPerRow: 10 },
        lowerSeats: { rows: ["E", "F"], seatsPerRow: 12 },
      },
    ];

    const theatres = [];
    for (const t of theatresData) {
      const saved = await Theatre.findOneAndUpdate({ theatreId: t.theatreId }, t, { upsert: true, new: true });
      theatres.push(saved);
    }
    console.log(`✅ ${theatres.length} Theatres seeded`);

    // 4. Seed Movies
    const moviesData = [
      {
        movieId: "MOV_INCEPTION",
        movieName: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        genres: ["Sci-Fi", "Action", "Adventure"],
        releaseDate: new Date("2010-07-16"),
        runtime: "148 min",
        certification: "U/A",
        media: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&auto=format&fit=crop&q=80",
        rating: 8.8,
        language: "English",
      },
      {
        movieId: "MOV_INTERSTELLAR",
        movieName: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
        genres: ["Sci-Fi", "Drama", "Adventure"],
        releaseDate: new Date("2014-11-07"),
        runtime: "169 min",
        certification: "U/A",
        media: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        rating: 8.7,
        language: "English",
      },
      {
        movieId: "MOV_DARK_KNIGHT",
        movieName: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        genres: ["Action", "Crime", "Drama"],
        releaseDate: new Date("2008-07-18"),
        runtime: "152 min",
        certification: "A",
        media: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
        rating: 9.0,
        language: "English",
      },
      {
        movieId: "MOV_OPPENHEIMER",
        movieName: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        genres: ["Biography", "Drama", "History"],
        releaseDate: new Date("2023-07-21"),
        runtime: "180 min",
        certification: "A",
        media: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80",
        rating: 8.9,
        language: "English",
      },
      {
        movieId: "MOV_DUNE_2",
        movieName: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genres: ["Sci-Fi", "Action", "Adventure"],
        releaseDate: new Date("2024-03-01"),
        runtime: "166 min",
        certification: "U/A",
        media: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
        backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
        rating: 8.6,
        language: "English",
      },
    ];

    const movies = [];
    for (const m of moviesData) {
      const saved = await Movie.findOneAndUpdate({ movieId: m.movieId }, m, { upsert: true, new: true });
      movies.push(saved);
    }
    console.log(`✅ ${movies.length} Movies seeded`);

    // 5. Seed Shows
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const showtimes = ["10:30 AM", "02:15 PM", "06:45 PM", "09:30 PM"];
    let showCount = 0;

    for (const movie of movies) {
      for (const theatre of theatres) {
        for (const dateStr of [todayStr, tomorrowStr]) {
          const st = showtimes[showCount % showtimes.length];
          const showId = `SHOW_${movie.movieId.replace("MOV_", "")}_${theatre.theatreId}_${dateStr.replace(/-/g, "")}_${st.replace(/[^a-zA-Z0-9]/g, "")}`;
          
          const tickets = generateTickets(theatre);
          // Pre-book 2-3 seats for realistic look
          if (tickets["C5"]) tickets["C5"].isBooked = true;
          if (tickets["C6"]) tickets["C6"].isBooked = true;
          if (tickets["D4"]) tickets["D4"].isBooked = true;

          await Show.findOneAndUpdate(
            { showId },
            {
              adminEmail,
              showId,
              movieId: movie.movieId,
              theatreName: theatre.theatreName,
              showdate: dateStr,
              showtime: st,
              tickets,
            },
            { upsert: true, new: true }
          );
          showCount++;
        }
      }
    }
    console.log(`✅ ${showCount} Shows seeded across all movies, theatres, and dates`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();

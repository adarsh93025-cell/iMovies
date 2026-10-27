const http = require("http");
const app = require("../server");

// Helper to make HTTP requests against the running test server
function request(server, options, postData) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: "127.0.0.1",
      port,
      path: options.path,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    if (postData) {
      const dataStr = typeof postData === "string" ? postData : JSON.stringify(postData);
      reqOptions.headers["Content-Type"] = "application/json";
      reqOptions.headers["Content-Length"] = Buffer.byteLength(dataStr);
    }

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (postData) {
      const dataStr = typeof postData === "string" ? postData : JSON.stringify(postData);
      req.write(dataStr);
    }
    req.end();
  });
}

async function runTests() {
  console.log("==========================================");
  console.log("   iMovies Backend Comprehensive Tests    ");
  console.log("==========================================\n");

  const testPort = 3001;
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(testPort, resolve));
  console.log(`Test server running on port ${testPort}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request(server, { path: "/api/health" });
    assert(health.status === 200 && health.data.status === "OK", "1. Health check endpoint responds OK");

    // 2. User registration
    const testUsername = `user_${Date.now().toString(36)}`;
    const testEmail = `${testUsername}@example.com`;
    const regRes = await request(
      server,
      { path: "/api/auth/register", method: "POST" },
      { username: testUsername, email: testEmail, password: "Password@123" }
    );
    assert(regRes.status === 201 && regRes.data.success, "2. User registration succeeds");

    // 3. Duplicate registration rejected
    const dupRes = await request(
      server,
      { path: "/api/auth/register", method: "POST" },
      { username: testUsername, email: testEmail, password: "Password@123" }
    );
    assert(dupRes.status === 400, "3. Duplicate registration is rejected");

    // 4. Valid login succeeds
    const loginRes = await request(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: testEmail, password: "Password@123" }
    );
    assert(loginRes.status === 200 && loginRes.data.authtoken, "4. Valid login succeeds and returns JWT");
    const userToken = loginRes.data.authtoken;

    // 5. Invalid credentials rejected
    const badLogin = await request(
      server,
      { path: "/api/auth/login", method: "POST" },
      { email: testEmail, password: "WrongPassword" }
    );
    assert(badLogin.status === 400, "5. Invalid credentials rejected");

    // 6. Protected route without token rejected
    const unauthRes = await request(server, { path: "/api/auth/me" });
    assert(unauthRes.status === 401, "6. Protected route without token rejected (401)");

    // 7. Protected route with valid token succeeds
    const authRes = await request(server, {
      path: "/api/auth/me",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(authRes.status === 200 && authRes.data.user.email === testEmail, "7. Protected route with token succeeds");

    // 8. Admin login succeeds
    const adminLogin = await request(
      server,
      { path: "/api/auth/admin/login", method: "POST" },
      { email: "admin@imovies.com", password: "Admin@12345" }
    );
    assert(adminLogin.status === 200 && adminLogin.data.authtoken, "8. Admin login succeeds");
    const adminToken = adminLogin.data.authtoken;

    // 9. Ordinary user blocked from admin routes
    const userOnAdmin = await request(server, {
      path: "/api/auth/admin/stats",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(userOnAdmin.status === 403, "9. Ordinary user blocked from admin routes (403)");

    // 10. Admin allowed on admin routes
    const adminOnAdmin = await request(server, {
      path: "/api/auth/admin/stats",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminOnAdmin.status === 200 && adminOnAdmin.data.stats, "10. Admin stats dashboard loads");

    // 11. Movie listings load correctly
    const moviesRes = await request(server, { path: "/api/movie" });
    assert(moviesRes.status === 200 && moviesRes.data.movies.length > 0, "11. Movie listings retrieved");

    // 12. Theatre listings load correctly
    const theatresRes = await request(server, { path: "/api/theatre" });
    assert(theatresRes.status === 200 && theatresRes.data.theatres.length > 0, "12. Theatre listings retrieved");

    // 13. Show listings load correctly
    const showsRes = await request(server, { path: "/api/shows" });
    assert(showsRes.status === 200 && showsRes.data.shows.length > 0, "13. Shows retrieved");
    const targetShow = showsRes.data.shows[0];

    // 14. Book seat for the show
    const bookRes = await request(
      server,
      {
        path: "/api/bookings",
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        showId: targetShow.showId,
        seats: ["A1", "A2"],
      }
    );
    assert(bookRes.status === 201 && bookRes.data.booking.bookingId, "14. Seat booking persists successfully");

    // 15. Duplicate seat reservation prevented (Seat concurrency integrity)
    const dupBookRes = await request(
      server,
      {
        path: "/api/bookings",
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        showId: targetShow.showId,
        seats: ["A1"], // already booked!
      }
    );
    assert(dupBookRes.status === 409, "15. Duplicate seat reservation rejected (409 Conflict)");

    // 16. User booking history restricted to user
    const historyRes = await request(server, {
      path: "/api/bookings",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      historyRes.status === 200 &&
        historyRes.data.bookings.length >= 1 &&
        historyRes.data.bookings.every((b) => b.userEmail === testEmail),
      "16. User booking history restricted strictly to user's own bookings"
    );

    // 17. Add and get favorite
    const favRes = await request(
      server,
      {
        path: "/api/favorite",
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      },
      { movieId: targetShow.movieId }
    );
    assert(favRes.status === 201 || favRes.status === 200, "17. Add favorite movie succeeds");

    const getFavs = await request(server, {
      path: "/api/favorite",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(getFavs.status === 200 && getFavs.data.favorites.length >= 1, "18. User favorites list retrieved");

    // 18. Add review
    const revRes = await request(
      server,
      {
        path: "/api/review",
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
      },
      {
        movieId: targetShow.movieId,
        rating: 9,
        review: "Masterpiece cinema experience! Visuals and audio were breathtaking.",
      }
    );
    assert(revRes.status === 201, "19. Submit movie review succeeds");

    // 19. Notifications endpoint
    const notifRes = await request(server, {
      path: "/api/notifications",
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(notifRes.status === 200 && notifRes.data.notifications.length >= 1, "20. In-app notifications generated");

    console.log(`\n==========================================`);
    console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==========================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    server.close();
    process.exit(1);
  }
}

runTests();

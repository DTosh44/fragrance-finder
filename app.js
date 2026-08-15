const app = document.querySelector("#app");
const baseUrl = new URL(".", import.meta.url);

let fragrances = [];
let recommendations = [];
let fragranceById = new Map();
let recommendationBySource = new Map();

const savedQuiz = sessionStorage.getItem("ff-quiz");
let quiz = savedQuiz
  ? JSON.parse(savedQuiz)
  : {
      step: 0,
      forWhom: "",
      favouriteId: "",
      lovedTraits: [],
      direction: "",
      occasion: "",
      intensity: "",
      adventure: "",
      search: "",
      audienceTab: "All",
    };

let explore = {
  search: "",
  audience: "All",
  family: "All",
  season: "All",
  intensity: "All",
  sort: "rank",
};

try {
  [fragrances, recommendations] = await Promise.all([
    fetch(new URL("data/fragrances.json", baseUrl)).then((response) => response.json()),
    fetch(new URL("data/recommendations.json", baseUrl)).then((response) => response.json()),
  ]);

  fragranceById = new Map(fragrances.map((item) => [item.id, item]));
  recommendationBySource = recommendations.reduce((map, item) => {
    const current = map.get(item.sourceId) || [];
    current.push(item);
    map.set(item.sourceId, current);
    return map;
  }, new Map());

  renderApp();
} catch (error) {
  console.error(error);
  app.innerHTML = `
    <main class="narrow page-hero">
      <div class="empty-state">
        <h2>The fragrance edit could not be loaded.</h2>
        <p class="muted">Run this site through a local web server rather than opening the HTML file directly.</p>
      </div>
    </main>`;
}

window.addEventListener("hashchange", () => {
  window.scrollTo(0, 0);
  renderApp();
});

function route() {
  const value = window.location.hash.replace(/^#/, "") || "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function renderApp() {
  const currentRoute = route();
  let content = "";
  let pageTitle = "Fragrance Finder | Discover Your Next Perfume or Aftershave";

  if (currentRoute === "/") {
    content = renderHome();
  } else if (currentRoute === "/find-your-fragrance") {
    content = renderQuiz();
    pageTitle = "Find Your Fragrance | Fragrance Finder";
  } else if (currentRoute === "/your-fragrance-edit") {
    content = renderResults();
    pageTitle = "Your Fragrance Edit | Fragrance Finder";
  } else if (currentRoute === "/fragrances") {
    content = renderExplore();
    pageTitle = "Explore Fragrances | Fragrance Finder";
  } else if (currentRoute.startsWith("/fragrance/")) {
    const slug = decodeURIComponent(currentRoute.slice("/fragrance/".length));
    const fragrance = fragrances.find((item) => item.slug === slug);
    content = fragrance ? renderDetail(fragrance) : renderNotFound();
    if (fragrance) pageTitle = `${fragrance.brand} ${fragrance.name} | Fragrance Finder`;
  } else if (currentRoute === "/how-it-works") {
    content = renderHowItWorks();
    pageTitle = "How It Works | Fragrance Finder";
  } else if (currentRoute === "/our-approach") {
    content = renderApproach();
    pageTitle = "Our Approach | Fragrance Finder";
  } else {
    content = renderNotFound();
    pageTitle = "Page Not Found | Fragrance Finder";
  }

  document.title = pageTitle;
  app.innerHTML = `${renderHeader(currentRoute)}<main id="main">${content}</main>${renderFooter()}`;
  bindGlobalEvents();

  if (currentRoute === "/find-your-fragrance") bindQuizEvents();
  if (currentRoute === "/your-fragrance-edit") bindResultEvents();
  if (currentRoute === "/fragrances") bindExploreEvents();
}

function renderHeader(currentRoute) {
  const active = (path) => (currentRoute === path || (path !== "/" && currentRoute.startsWith(path)) ? "active" : "");
  return `
    <header class="site-header">
      <div class="shell header-inner">
        <a class="logo" href="#/" aria-label="Fragrance Finder home">
          ${brandMark()}
          <span class="wordmark"><span>Fragrance</span><span>Finder</span></span>
        </a>
        <nav class="desktop-nav" aria-label="Primary navigation">
          <a class="${active("/find-your-fragrance")}" href="#/find-your-fragrance">Find your match</a>
          <a class="${active("/how-it-works")}" href="#/how-it-works">How it works</a>
          <a class="${active("/fragrances")}" href="#/fragrances">Explore fragrances</a>
          <a class="${active("/our-approach")}" href="#/our-approach">Our approach</a>
        </nav>
        <a class="button oxblood header-action" href="#/find-your-fragrance">Find your match <span>→</span></a>
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
      </div>
      <nav class="mobile-menu" aria-label="Mobile navigation">
        <a href="#/find-your-fragrance">Find your match</a>
        <a href="#/how-it-works">How it works</a>
        <a href="#/fragrances">Explore fragrances</a>
        <a href="#/our-approach">Our approach</a>
        <a class="button oxblood" href="#/find-your-fragrance">Start the fragrance chooser</a>
      </nav>
    </header>`;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="shell">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="logo" href="#/" aria-label="Fragrance Finder home">
              ${brandMark()}
              <span class="wordmark"><span>Fragrance</span><span>Finder</span></span>
            </a>
            <p>Find the fragrance that comes next.</p>
          </div>
          <div class="footer-col">
            <h3>Discover</h3>
            <a href="#/find-your-fragrance">Find your match</a>
            <a href="#/fragrances">Explore fragrances</a>
            <a href="#/how-it-works">How it works</a>
          </div>
          <div class="footer-col">
            <h3>About</h3>
            <a href="#/our-approach">Our approach</a>
            <a href="#/our-approach">Data &amp; methodology</a>
            <a href="mailto:hello@fragrancefinder.co.uk">Contact</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>Fragrance Finder is an independent discovery tool. Brand names and trademarks belong to their respective owners. Recommendations and match scores are guidance only; always sample on skin where possible.</p>
          <span>© ${new Date().getFullYear()} Fragrance Finder</span>
        </div>
      </div>
    </footer>`;
}

function brandMark() {
  return `<span class="brand-mark" aria-hidden="true"><span>F</span><span>F</span><i></i></span>`;
}

function renderHome() {
  const popular = [
    ...fragrances.filter((item) => item.audience === "Perfume").slice(0, 3),
    ...fragrances.filter((item) => item.audience === "Aftershave").slice(0, 3),
  ];

  return `
    <section class="hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Considered fragrance discovery</p>
          <h1 class="display">Find the fragrance<br>that <em>comes next.</em></h1>
          <p class="lead">Start with one you love. Discover a considered edit of fragrances with something in common — from their notes and character to when and how you like to wear them.</p>
          <div class="hero-actions">
            <a class="button oxblood" href="#/find-your-fragrance">Find your match <span>→</span></a>
            <a class="text-button" href="#/fragrances">Explore the edit</a>
          </div>
        </div>
        <div class="hero-art" role="img" aria-label="Abstract glass and oxblood fragrance composition">
          <span class="art-caption">A new way to discover scent</span>
        </div>
      </div>
    </section>

    <section class="principles" aria-label="What makes Fragrance Finder different">
      <div class="shell principle-grid">
        <article class="principle"><h3>Expert curation</h3><p>Thoughtful matches, not endless options.</p></article>
        <article class="principle"><h3>Shared character</h3><p>Similar notes, structure and mood.</p></article>
        <article class="principle"><h3>Discover more</h3><p>Find new favourites with confidence.</p></article>
      </div>
    </section>

    <section class="content-section">
      <div class="shell">
        <div class="section-heading">
          <div><p class="eyebrow">The fragrance edit</p><h2 class="section-title">Popular starting points</h2></div>
          <a class="text-button" href="#/fragrances">View all 100 fragrances →</a>
        </div>
        <div class="card-grid">${popular.map(fragranceCard).join("")}</div>
      </div>
    </section>

    <section class="content-section">
      <div class="shell editorial-split">
        <div class="editorial-art" role="img" aria-label="Abstract mineral, glass and oxblood composition"></div>
        <div class="editorial-copy">
          <p class="eyebrow">Not a dupe finder</p>
          <h2 class="section-title">A discovery tool for people who want to explore.</h2>
          <p class="lead">We look for shared structure, mood and character, then show you where each recommendation stays familiar — and where it moves somewhere new.</p>
          <a class="button light" href="#/our-approach">Read our approach →</a>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="shell">
        <div class="section-heading"><div><p class="eyebrow">How it works</p><h2 class="section-title">A considered edit in three steps.</h2></div></div>
        <div class="steps-grid">
          <article class="step-card"><span class="step-number">1</span><h3>Choose a favourite</h3><p>Select a perfume or men's fragrance that you already know and love.</p></article>
          <article class="step-card"><span class="step-number">2</span><h3>Tell us what matters</h3><p>Answer a few focused questions about mood, intensity, occasion and how far you want to explore.</p></article>
          <article class="step-card"><span class="step-number">3</span><h3>Meet your matches</h3><p>Receive three recommendations with transparent match scores, shared accords and important differences.</p></article>
        </div>
        <div style="margin-top:34px"><a class="button oxblood" href="#/find-your-fragrance">Start the chooser →</a></div>
      </div>
    </section>`;
}

function fragranceCard(item) {
  return `
    <a class="fragrance-card" href="#/fragrance/${encodeURIComponent(item.slug)}">
      <div class="scent-visual" style="${visualStyle(item)}">
        <span class="rank-chip">UK edit #${item.popularityRank}</span>
        <span class="audience-chip">${item.audience === "Perfume" ? "Perfume" : "Men's"}</span>
      </div>
      <div class="fragrance-card-body">
        <p class="brand-label">${escapeHtml(item.brand)}</p>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="card-meta">${escapeHtml(item.concentration)} · ${escapeHtml(item.family)}</p>
        <div class="tag-list">${item.accords.slice(0, 3).map(tag).join("")}</div>
        <span class="card-link">View fragrance <span>→</span></span>
      </div>
    </a>`;
}

function renderQuiz() {
  const question = renderQuizQuestion();
  return `
    <section class="quiz-page">
      <div class="quiz-shell">
        <div class="quiz-topline"><span>Your fragrance profile</span><span>${quiz.step + 1} of 7</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${((quiz.step + 1) / 7) * 100}%"></div></div>
        ${question}
        <div class="quiz-actions">
          <button class="quiz-back" type="button" data-quiz-back ${quiz.step === 0 ? "disabled" : ""}>← Back</button>
          <button class="button oxblood" type="button" data-quiz-next ${canContinue() ? "" : "disabled"}>${quiz.step === 6 ? "Reveal my matches" : "Continue"} →</button>
        </div>
      </div>
    </section>`;
}

function renderQuizQuestion() {
  const source = fragranceById.get(quiz.favouriteId);
  const person = quiz.forWhom === "Someone else" ? "their" : "your";

  if (quiz.step === 0) {
    return questionShell(
      "Who are we finding a fragrance for?",
      "We will tailor the wording of your edit. The recommendation method stays exactly the same.",
      choiceGrid([
        ["Me", "A new fragrance for your own collection."],
        ["Someone else", "A considered recommendation for a partner, friend or family member."],
      ], quiz.forWhom, "forWhom")
    );
  }

  if (quiz.step === 1) {
    return questionShell(
      `Which fragrance do ${quiz.forWhom === "Someone else" ? "they" : "you"} already love?`,
      "Search our current UK edit of 50 perfumes and 50 men's fragrances.",
      `<div class="search-panel">
        <div class="segmented" aria-label="Filter fragrance audience">
          ${["All", "Perfume", "Men's"].map((tab) => `<button type="button" class="${quiz.audienceTab === tab ? "active" : ""}" data-audience-tab="${tab}">${tab}</button>`).join("")}
        </div>
        <input class="search-input" id="fragrance-search" type="search" autocomplete="off" placeholder="Try ‘Sauvage’, ‘Libre’ or a brand name" value="${escapeAttribute(quiz.search)}" aria-label="Search fragrances">
        <div class="search-results" id="search-results">${quizSearchResults()}</div>
        ${source ? `<div class="selected-fragrance"><p><strong>${escapeHtml(source.brand)} ${escapeHtml(source.name)}</strong><br><span class="muted">${escapeHtml(source.concentration)} · ${escapeHtml(source.family)}</span></p><button type="button" data-clear-favourite>Change</button></div>` : ""}
      </div>`
    );
  }

  if (quiz.step === 2) {
    const values = [
      ...(source?.accords || []).map((accord) => [titleCase(accord), `Keep the ${accord} character in the recommendation.`]),
      ["The overall feel", `Preserve the way ${source ? `${source.name} feels` : "it feels"}, not one specific note.`],
      ["How it makes me feel", "Prioritise confidence, comfort or mood over a close scent profile."],
      ["Not sure", "Use the full structured profile as the starting point."],
    ];
    return questionShell(
      `What do ${quiz.forWhom === "Someone else" ? "they" : "you"} love most about it?`,
      "Choose up to three. If you are not sure, that is useful too.",
      choiceGrid(values, quiz.lovedTraits, "lovedTraits", true)
    );
  }

  if (quiz.step === 3) {
    return questionShell(
      `Where should the next fragrance take ${quiz.forWhom === "Someone else" ? "them" : "you"}?`,
      "This has the strongest influence on how familiar or exploratory the final edit feels.",
      choiceGrid([
        ["Keep it familiar", `Stay close to ${person} favourite's profile.`],
        ["Make it lighter", "Keep the connection, with a fresher or softer feel."],
        ["Add more depth", "Move towards richer notes and stronger presence."],
        ["Keep the mood, change the scent", "Preserve the character while exploring a different profile."],
        ["Surprise me", "Let the strongest overall relationships lead."],
      ], quiz.direction, "direction")
    );
  }

  if (quiz.step === 4) {
    return questionShell(
      "When will it be worn most often?",
      "Choose the setting that matters most. We use the fragrance's season, mood and best-use profile together.",
      choiceGrid([
        ["Everyday", "A versatile reach without needing a special occasion."],
        ["Work", "Polished and appropriate for shared spaces."],
        ["Dates and evenings", "A more intimate or dressed-up feel."],
        ["Nights out", "More presence for social settings."],
        ["Special occasions", "Distinctive enough to mark the moment."],
        ["Holidays and warm weather", "Well suited to heat, travel and daytime."],
        ["No particular occasion", "Do not favour one setting."],
      ], quiz.occasion, "occasion")
    );
  }

  if (quiz.step === 5) {
    return questionShell(
      "How much presence feels right?",
      "Intensity describes the overall strength in our dataset, not a guaranteed measure of longevity or projection.",
      choiceGrid([
        ["Subtle", "Intensity 1–2: softer and closer to the skin."],
        ["Balanced", "Intensity 3–4: noticeable without dominating."],
        ["Strong", "Intensity 4–5: confident and more assertive."],
        ["No preference", "Let the other answers decide."],
      ], quiz.intensity, "intensity")
    );
  }

  return questionShell(
    "How adventurous should the edit be?",
    "There is no wrong answer. This changes whether we reward close profiles or more distinctive new directions.",
    choiceGrid([
      ["Familiar", "Stay close to proven notes, mood and structure."],
      ["Balanced", "A recognisable connection with something new."],
      ["Adventurous", "Prioritise interesting new angles and changed profiles."],
    ], quiz.adventure, "adventure", false, "three")
  );
}

function questionShell(title, help, content) {
  return `<div class="quiz-question"><h1>${title}</h1><p class="question-help">${help}</p>${content}</div>`;
}

function choiceGrid(options, selected, field, multi = false, extraClass = "") {
  const selectedValues = Array.isArray(selected) ? selected : [selected];
  return `<div class="choice-grid ${extraClass}">${options.map(([label, description]) => `
    <button type="button" class="choice ${selectedValues.includes(label) ? "selected" : ""}" data-choice-field="${field}" data-choice-value="${escapeAttribute(label)}" data-choice-multi="${multi}">
      <strong>${escapeHtml(label)}</strong><small>${escapeHtml(description)}</small>
    </button>`).join("")}</div>`;
}

function quizSearchResults() {
  const search = quiz.search.trim().toLowerCase();
  const filtered = fragrances
    .filter((item) => quiz.audienceTab === "All" || item.audience === (quiz.audienceTab === "Men's" ? "Aftershave" : "Perfume"))
    .filter((item) => !search || `${item.brand} ${item.name} ${item.family}`.toLowerCase().includes(search))
    .slice(0, 12);

  if (!filtered.length) return `<div class="search-result"><span>No fragrance found. Try a shorter name or brand.</span></div>`;
  return filtered.map((item) => `
    <button type="button" class="search-result ${quiz.favouriteId === item.id ? "selected" : ""}" data-favourite-id="${item.id}">
      <span><strong>${escapeHtml(item.brand)} · ${escapeHtml(item.name)}</strong>${escapeHtml(item.family)}</span>
      <span>${item.audience === "Perfume" ? "Perfume" : "Men's"} · ${escapeHtml(item.concentration)}</span>
    </button>`).join("");
}

function canContinue() {
  if (quiz.step === 0) return Boolean(quiz.forWhom);
  if (quiz.step === 1) return Boolean(quiz.favouriteId);
  if (quiz.step === 2) return quiz.lovedTraits.length > 0;
  if (quiz.step === 3) return Boolean(quiz.direction);
  if (quiz.step === 4) return Boolean(quiz.occasion);
  if (quiz.step === 5) return Boolean(quiz.intensity);
  return Boolean(quiz.adventure);
}

function bindQuizEvents() {
  document.querySelectorAll("[data-choice-field]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.choiceField;
      const value = button.dataset.choiceValue;
      const multi = button.dataset.choiceMulti === "true";
      if (multi) {
        const current = new Set(quiz[field]);
        if (current.has(value)) current.delete(value);
        else if (current.size < 3) current.add(value);
        quiz[field] = [...current];
      } else {
        quiz[field] = value;
      }
      saveQuiz();
      renderApp();
    });
  });

  document.querySelectorAll("[data-audience-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      quiz.audienceTab = button.dataset.audienceTab;
      quiz.search = "";
      saveQuiz();
      renderApp();
    });
  });

  const searchInput = document.querySelector("#fragrance-search");
  searchInput?.addEventListener("input", (event) => {
    quiz.search = event.target.value;
    saveQuiz();
    const results = document.querySelector("#search-results");
    if (results) {
      results.innerHTML = quizSearchResults();
      bindFavouriteButtons();
    }
  });

  bindFavouriteButtons();

  document.querySelector("[data-clear-favourite]")?.addEventListener("click", () => {
    quiz.favouriteId = "";
    quiz.lovedTraits = [];
    saveQuiz();
    renderApp();
  });

  document.querySelector("[data-quiz-back]")?.addEventListener("click", () => {
    if (quiz.step > 0) quiz.step -= 1;
    saveQuiz();
    renderApp();
  });

  document.querySelector("[data-quiz-next]")?.addEventListener("click", () => {
    if (!canContinue()) return;
    if (quiz.step < 6) {
      quiz.step += 1;
      saveQuiz();
      renderApp();
      window.scrollTo(0, 0);
    } else {
      saveQuiz();
      window.location.hash = "#/your-fragrance-edit";
    }
  });
}

function bindFavouriteButtons() {
  document.querySelectorAll("[data-favourite-id]").forEach((button) => {
    button.addEventListener("click", () => {
      quiz.favouriteId = button.dataset.favouriteId;
      quiz.lovedTraits = [];
      saveQuiz();
      renderApp();
    });
  });
}

function saveQuiz() {
  sessionStorage.setItem("ff-quiz", JSON.stringify(quiz));
}

function calculateMatches() {
  const source = fragranceById.get(quiz.favouriteId);
  if (!source) return [];
  const sourceRecommendations = recommendationBySource.get(source.id) || [];

  return sourceRecommendations
    .map((relationship) => {
      const item = fragranceById.get(relationship.recommendationId);
      let score = relationship.baseScore;
      const reasons = [];

      const directionAdjustments = {
        "Keep it familiar": { "Closest profile": 6, "Same family, new angle": 3, "Same mood, different scent": -4 },
        "Make it lighter": { "Lighter / fresher": 6, "Closest profile": 3, "Richer / stronger": -4 },
        "Add more depth": { "Richer / stronger": 6, "Closest profile": 3, "Lighter / fresher": -4 },
        "Keep the mood, change the scent": { "Same mood, different scent": 6, "Same family, new angle": 3, "Closest profile": -4 },
        "Surprise me": {},
      };
      const directionDelta = directionAdjustments[quiz.direction]?.[relationship.direction] || 0;
      score += directionDelta;
      if (directionDelta > 0) reasons.push("your preferred direction");

      const occasionDelta = occasionAdjustment(item, quiz.occasion);
      score += occasionDelta;
      if (occasionDelta > 0) reasons.push("when it will be worn");

      const intensityDelta = intensityAdjustment(item.intensity, quiz.intensity);
      score += intensityDelta;
      if (intensityDelta > 0) reasons.push("the level of presence you chose");

      const lovedAccords = quiz.lovedTraits.map((trait) => trait.toLowerCase()).filter((trait) => source.accords.includes(trait));
      const accordMatches = lovedAccords.filter((accord) => item.accords.includes(accord)).length;
      const accordDelta = Math.min(6, accordMatches * 2);
      score += accordDelta;
      if (accordDelta > 0) reasons.push("the notes you value most");

      if (quiz.adventure === "Familiar") {
        if (relationship.direction === "Closest profile") score += 4;
        if (relationship.direction === "Same mood, different scent") score -= 2;
      }
      if (quiz.adventure === "Adventurous") {
        if (relationship.direction === "Same mood, different scent") score += 4;
        if (relationship.direction === "Same family, new angle") score += 3;
        if (relationship.direction === "Closest profile") score -= 2;
      }

      // Personal preference bonuses have diminishing headroom when a dataset
      // relationship is already very strong. This avoids several results all
      // collapsing to 99 while still preserving every adjustment and ranking.
      const rawAdjustment = score - relationship.baseScore;
      if (rawAdjustment > 0) {
        const headroomFactor = Math.max(0.22, (100 - relationship.baseScore) / 25);
        score = relationship.baseScore + rawAdjustment * headroomFactor;
      }

      return {
        ...relationship,
        fragrance: item,
        finalScore: Math.max(50, Math.min(99, Math.round(score))),
        personalisedFor: [...new Set(reasons)],
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore || a.rank - b.rank)
    .slice(0, 3);
}

function occasionAdjustment(item, occasion) {
  if (!occasion || occasion === "No particular occasion") return 0;
  const profile = `${item.bestFor} ${item.moods.join(" ")} ${item.seasons.join(" ")}`.toLowerCase();
  const strong = {
    Everyday: ["everyday", "versatile", "casual", "daytime", "signature"],
    Work: ["work", "polished", "smart", "understated", "clean"],
    "Dates and evenings": ["date", "evening", "sensual", "romantic", "dinner"],
    "Nights out": ["night", "party", "club", "bold", "social"],
    "Special occasions": ["occasion", "formal", "event", "wedding", "celebration"],
    "Holidays and warm weather": ["holiday", "summer", "warm weather", "travel", "fresh", "aquatic"],
  }[occasion] || [];
  const hits = strong.filter((term) => profile.includes(term)).length;
  return hits >= 2 ? 5 : hits === 1 ? 2 : 0;
}

function intensityAdjustment(value, preference) {
  if (!preference || preference === "No preference") return 0;
  const targets = { Subtle: [1, 2], Balanced: [3, 4], Strong: [4, 5] }[preference];
  if (targets.includes(value)) return 4;
  if (Math.min(...targets.map((target) => Math.abs(target - value))) === 1) return 2;
  return -4;
}

function renderResults() {
  const source = fragranceById.get(quiz.favouriteId);
  const matches = calculateMatches();
  if (!source || !matches.length) {
    return `<section class="page-hero"><div class="narrow empty-state"><h2>Let’s find your starting point first.</h2><p class="muted">Complete the fragrance chooser to create your considered edit.</p><a class="button oxblood" href="#/find-your-fragrance">Start the chooser →</a></div></section>`;
  }

  const labels = ["Strongest match", "Worth exploring", "A different direction"];
  return `
    <section class="results-hero">
      <div class="shell result-intro-grid">
        <div>
          <p class="eyebrow">Your considered fragrance edit</p>
          <h1 class="title">Three scents chosen around what ${quiz.forWhom === "Someone else" ? "they" : "you"} already love.</h1>
          <p class="lead">The scores below combine the dataset relationship with your answers. They are a clear guide to relevance, not a scientific prediction.</p>
        </div>
        <div class="source-summary">
          <p class="brand-label">Starting with</p>
          <h2>${escapeHtml(source.brand)} · ${escapeHtml(source.name)}</h2>
          <p class="card-meta">${escapeHtml(source.concentration)} · ${escapeHtml(source.family)} · Intensity ${source.intensity}/5</p>
          <div class="tag-list">${source.accords.map(tag).join("")}</div>
        </div>
      </div>
    </section>

    <section class="shell result-stack">
      ${matches.map((match, index) => resultCard(match, labels[index])).join("")}
      <div class="section-heading" style="margin-top:55px"><div><p class="eyebrow">At a glance</p><h2 class="section-title">Compare your edit</h2></div></div>
      ${comparisonTable(source, matches)}
      <div class="notice">Fragrance develops differently on every person. Use this edit to shortlist, then sample on skin and allow the dry-down time before deciding.</div>
      <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:22px">
        <button class="button oxblood" type="button" data-restart-quiz>Start a new edit</button>
        <a class="button light" href="#/fragrances">Explore all fragrances</a>
      </div>
    </section>`;
}

function resultCard(match, label) {
  const item = match.fragrance;
  return `
    <article class="result-card">
      <div class="scent-visual" style="${visualStyle(item)}"><span class="audience-chip">${escapeHtml(match.direction)}</span></div>
      <div class="result-copy">
        <p class="result-position">${label}</p>
        <p class="brand-label">${escapeHtml(item.brand)}</p>
        <h3>${escapeHtml(item.name)}</h3>
        <p class="card-meta">${escapeHtml(item.concentration)} · ${escapeHtml(item.family)} · ${escapeHtml(match.confidence)} dataset confidence</p>
        <p class="result-why">${escapeHtml(match.why)}${match.personalisedFor.length ? ` This result was also strengthened by ${escapeHtml(joinNatural(match.personalisedFor))}.` : ""}</p>
        <div class="tag-list">${match.sharedAccords.length ? match.sharedAccords.map(tag).join("") : item.accords.slice(0, 3).map(tag).join("")}</div>
        <p class="result-caveat"><strong>Worth knowing:</strong> ${escapeHtml(match.caveat)}</p>
        <a class="text-button" href="#/fragrance/${encodeURIComponent(item.slug)}">View full profile →</a>
      </div>
      <div class="score-panel">
        <div class="score-ring" style="--score:${match.finalScore}"><strong>${match.finalScore}%</strong></div>
        <span>Match score</span>
      </div>
    </article>`;
}

function comparisonTable(source, matches) {
  const items = [{ fragrance: source, finalScore: "Starting point", direction: "Favourite" }, ...matches];
  return `<div class="comparison-wrap"><table class="comparison-table">
    <thead><tr><th>Fragrance</th><th>Match</th><th>Family</th><th>Intensity</th><th>Best for</th></tr></thead>
    <tbody>${items.map(({ fragrance, finalScore, direction }) => `<tr>
      <td><strong>${escapeHtml(fragrance.brand)} ${escapeHtml(fragrance.name)}</strong><br><span class="muted">${escapeHtml(fragrance.concentration)}</span></td>
      <td>${typeof finalScore === "number" ? `${finalScore}% · ${escapeHtml(direction)}` : finalScore}</td>
      <td>${escapeHtml(fragrance.family)}</td><td>${fragrance.intensity}/5</td><td>${escapeHtml(fragrance.bestFor)}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function bindResultEvents() {
  document.querySelector("[data-restart-quiz]")?.addEventListener("click", resetQuiz);
}

function resetQuiz() {
  quiz = {
    step: 0, forWhom: "", favouriteId: "", lovedTraits: [], direction: "", occasion: "",
    intensity: "", adventure: "", search: "", audienceTab: "All",
  };
  saveQuiz();
  window.location.hash = "#/find-your-fragrance";
}

function renderExplore() {
  const families = [...new Set(fragrances.map((item) => item.family))].sort();
  const seasons = ["spring", "summer", "autumn", "winter"];
  const results = filteredExploreResults();
  return `
    <section class="page-hero">
      <div class="shell"><p class="eyebrow">The full UK launch edit</p><h1 class="title">Explore 100 fragrances.</h1><p class="lead">Browse the perfumes and men's fragrances in our launch dataset, then open any profile to see its five closest curated comparisons.</p></div>
    </section>
    <section class="content-section">
      <div class="shell">
        <div class="filters">
          <input class="filter-control" type="search" data-filter="search" value="${escapeAttribute(explore.search)}" placeholder="Search brand, fragrance or accord">
          ${selectFilter("audience", ["All", "Perfume", "Men's"], explore.audience, "Audience")}
          ${selectFilter("family", ["All", ...families], explore.family, "Family")}
          ${selectFilter("season", ["All", ...seasons.map(titleCase)], explore.season, "Season")}
          ${selectFilter("intensity", ["All", "1", "2", "3", "4", "5"], explore.intensity, "Intensity")}
          ${selectFilter("sort", ["rank|Popularity rank", "az|A–Z", "intensityHigh|Intensity: high to low"], explore.sort, "Sort")}
        </div>
        <p class="results-count">Showing ${results.length} of ${fragrances.length} fragrances</p>
        ${results.length ? `<div class="card-grid">${results.map(fragranceCard).join("")}</div>` : `<div class="empty-state"><h2>No fragrances match those filters.</h2><p class="muted">Try removing a filter or using a shorter search.</p></div>`}
      </div>
    </section>`;
}

function selectFilter(field, options, selected, label) {
  return `<select class="filter-control" data-filter="${field}" aria-label="${label}">
    ${options.map((option) => {
      const [value, text = option] = String(option).split("|");
      return `<option value="${escapeAttribute(value)}" ${String(selected) === value ? "selected" : ""}>${escapeHtml(label)}: ${escapeHtml(text)}</option>`;
    }).join("")}
  </select>`;
}

function filteredExploreResults() {
  const search = explore.search.trim().toLowerCase();
  return fragrances
    .filter((item) => explore.audience === "All" || item.audience === (explore.audience === "Men's" ? "Aftershave" : "Perfume"))
    .filter((item) => explore.family === "All" || item.family === explore.family)
    .filter((item) => explore.season === "All" || item.seasons.includes(explore.season.toLowerCase()))
    .filter((item) => explore.intensity === "All" || item.intensity === Number(explore.intensity))
    .filter((item) => !search || `${item.brand} ${item.name} ${item.family} ${item.accords.join(" ")} ${item.moods.join(" ")}`.toLowerCase().includes(search))
    .sort((a, b) => {
      if (explore.sort === "az") return `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`);
      if (explore.sort === "intensityHigh") return b.intensity - a.intensity || a.popularityRank - b.popularityRank;
      return a.audience.localeCompare(b.audience) || a.popularityRank - b.popularityRank;
    });
}

function bindExploreEvents() {
  document.querySelectorAll("[data-filter]").forEach((control) => {
    const eventName = control.tagName === "INPUT" ? "input" : "change";
    control.addEventListener(eventName, (event) => {
      explore[event.target.dataset.filter] = event.target.value;
      renderApp();
      if (eventName === "input") {
        const nextInput = document.querySelector('[data-filter="search"]');
        nextInput?.focus();
        nextInput?.setSelectionRange(nextInput.value.length, nextInput.value.length);
      }
    });
  });
}

function renderDetail(item) {
  const relationships = (recommendationBySource.get(item.id) || []).slice(0, 5);
  return `
    <section class="detail-hero">
      <div class="scent-visual" style="${visualStyle(item)}"><span class="rank-chip">UK edit #${item.popularityRank}</span></div>
      <div class="detail-copy">
        <p class="eyebrow">${item.audience === "Perfume" ? "Perfume profile" : "Men's fragrance profile"}</p>
        <p class="brand-label">${escapeHtml(item.brand)}</p>
        <h1>${escapeHtml(item.name)}</h1>
        <p class="lead">${escapeHtml(item.family)} with ${escapeHtml(joinNatural(item.accords.slice(0, 4)))} character.</p>
        <div class="detail-facts">
          <div class="detail-fact"><span>Concentration</span><strong>${escapeHtml(item.concentration)}</strong></div>
          <div class="detail-fact"><span>Intensity</span><strong>${item.intensity}/5</strong></div>
          <div class="detail-fact"><span>Best suited to</span><strong>${escapeHtml(item.bestFor)}</strong></div>
          <div class="detail-fact"><span>Seasons</span><strong>${escapeHtml(item.seasons.map(titleCase).join(" · "))}</strong></div>
        </div>
        <a class="button oxblood" href="#/find-your-fragrance" style="margin-top:28px">Use as my starting fragrance →</a>
      </div>
    </section>
    <section class="content-section">
      <div class="shell prose-grid">
        <h2 class="section-title">The profile</h2>
        <div class="prose">
          <p>${escapeHtml(item.brand)} ${escapeHtml(item.name)} sits within the ${escapeHtml(item.family.toLowerCase())} family. In this dataset it is characterised by ${escapeHtml(joinNatural(item.accords))}, with a mood that reads as ${escapeHtml(joinNatural(item.moods))}.</p>
          <h3>Dominant accords</h3><div class="tag-list">${item.accords.map(tag).join("")}</div>
          <h3>Where it works</h3><p>${escapeHtml(item.bestFor)}. Its structured season profile favours ${escapeHtml(joinNatural(item.seasons.map(titleCase)))}.</p>
          <div class="notice">This profile summarises the structured launch dataset. Performance varies with concentration, application, skin chemistry, climate and individual perception.</div>
        </div>
      </div>
    </section>
    <section class="content-section">
      <div class="shell">
        <div class="section-heading"><div><p class="eyebrow">Comparable fragrances</p><h2 class="section-title">Five directions from this favourite.</h2><p class="lead">Each comparison explains the shared character and the most important difference.</p></div></div>
        <div class="card-grid">${relationships.map((relationship) => {
          const related = fragranceById.get(relationship.recommendationId);
          return `<a class="fragrance-card" href="#/fragrance/${encodeURIComponent(related.slug)}">
            <div class="scent-visual" style="${visualStyle(related)}"><span class="rank-chip">${escapeHtml(relationship.direction)}</span></div>
            <div class="fragrance-card-body"><p class="brand-label">${escapeHtml(related.brand)}</p><h3>${escapeHtml(related.name)}</h3><p class="card-meta">Base relationship ${relationship.baseScore}% · ${escapeHtml(relationship.confidence)} confidence</p><p class="muted" style="font-size:12px">${escapeHtml(relationship.why)}</p><div class="tag-list">${relationship.sharedAccords.map(tag).join("")}</div><span class="card-link">View comparison <span>→</span></span></div>
          </a>`;
        }).join("")}</div>
      </div>
    </section>`;
}

function renderHowItWorks() {
  return `
    <section class="page-hero"><div class="shell"><p class="eyebrow">How it works</p><h1 class="title">A smaller, more useful shortlist.</h1><p class="lead">The chooser starts with a scent you already understand, then uses seven focused answers to refine five dataset relationships into a personal top three.</p></div></section>
    <section class="content-section"><div class="shell steps-grid">
      <article class="step-card"><span class="step-number">1</span><h3>A known favourite</h3><p>Choose from the current UK edit of 100 fragrances. This gives the system a real, structured starting profile.</p></article>
      <article class="step-card"><span class="step-number">2</span><h3>Your preferences</h3><p>Tell us which facets matter, how adventurous to be, the intended occasion and the right level of presence.</p></article>
      <article class="step-card"><span class="step-number">3</span><h3>A transparent result</h3><p>See three ranked matches, why each fits, their shared accords, important differences and a clear match score.</p></article>
    </div></section>
    <section class="content-section"><div class="narrow"><p class="eyebrow">What the score means</p><h2 class="section-title">Relevance, made legible.</h2><p class="lead">The score begins with a precomputed relationship based on family, accord, mood, season, intensity and community-affinity patterns. Your answers then make small, visible adjustments. Scores are capped at 99% because scent preference can never be guaranteed.</p><div class="notice">Fragrance Finder does not claim that two fragrances are identical, and it does not predict skin chemistry. Treat the score as a way to rank what to sample first.</div><a class="button oxblood" href="#/find-your-fragrance" style="margin-top:28px">Create my edit →</a></div></section>`;
}

function renderApproach() {
  return `
    <section class="page-hero"><div class="shell"><p class="eyebrow">Our approach</p><h1 class="title">Clear data. Considered judgement.</h1><p class="lead">Fragrance discovery is subjective. Our method is designed to make the starting evidence and recommendation logic useful without pretending that personal taste is a precise science.</p></div></section>
    <section class="content-section"><div class="shell prose-grid">
      <h2 class="section-title">The launch dataset</h2>
      <div class="prose">
        <p>The current edit contains 50 perfumes and 50 men's fragrances selected from UK retailer popularity and bestseller routes reviewed in August 2026. It is a practical launch list, not an audited national sales ranking.</p>
        <h3>What each profile contains</h3><p>Brand, fragrance, concentration, family, dominant accords, mood, seasons, intensity and best-use context. Each fragrance is connected to five comparable choices.</p>
        <h3>How comparisons are formed</h3><p>We combine structured profile overlap with community-affinity groupings informed by fragrance discussion routes. The output looks for shared character and deliberate directions such as closer profile, lighter and fresher, richer and stronger, or the same mood through a different scent.</p>
        <h3>What “AI chooser” means here</h3><p>The chooser is a transparent recommendation engine. It uses your answers to rerank known dataset relationships; it does not invent fragrances, fabricate reviews or generate unsupported product claims. This makes the first version fast, explainable and inexpensive to run.</p>
        <div class="notice"><strong>Independent project:</strong> Fragrance Finder is not affiliated with or endorsed by the fragrance brands included. All trademarks remain the property of their owners.</div>
      </div>
    </div></section>`;
}

function renderNotFound() {
  return `<section class="page-hero"><div class="narrow empty-state"><h2>That page has drifted away.</h2><p class="muted">Return to the fragrance edit or begin a new match.</p><a class="button oxblood" href="#/">Return home →</a></div></section>`;
}

function bindGlobalEvents() {
  const menuButton = document.querySelector(".menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");
  menuButton?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuButton.textContent = open ? "×" : "☰";
    document.body.classList.toggle("menu-open", open);
  });
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => document.body.classList.remove("menu-open")));
}

function visualStyle(item) {
  const palette = {
    citrus: ["rgba(202,168,92,.86)", "rgba(238,220,176,.64)"],
    vanilla: ["rgba(186,145,93,.72)", "rgba(243,226,194,.82)"],
    rose: ["rgba(111,32,48,.8)", "rgba(211,156,165,.55)"],
    woody: ["rgba(91,65,46,.8)", "rgba(152,167,154,.58)"],
    aquatic: ["rgba(71,112,119,.74)", "rgba(181,207,202,.7)"],
    leather: ["rgba(62,44,35,.85)", "rgba(121,71,57,.65)"],
    jasmine: ["rgba(228,218,183,.86)", "rgba(152,167,154,.62)"],
    coffee: ["rgba(72,42,31,.85)", "rgba(111,32,48,.62)"],
    lavender: ["rgba(104,94,123,.72)", "rgba(205,198,219,.72)"],
    amber: ["rgba(175,105,51,.82)", "rgba(111,32,48,.55)"],
  };
  const key = item.accords.find((accord) => palette[accord]) || "woody";
  const [a, b] = palette[key];
  return `--tone-a:${a};--tone-b:${b}`;
}

function tag(value) {
  return `<span class="tag">${escapeHtml(titleCase(value))}</span>`;
}

function titleCase(value) {
  return String(value).replace(/\b\w/g, (character) => character.toUpperCase());
}

function joinNatural(values) {
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

// Dependency-free test hooks. These exports are inert in the browser and keep
// the recommendation logic straightforward to validate in CI or locally.
export function setQuizForTest(value) {
  quiz = { ...quiz, ...value };
}

export function setExploreForTest(value) {
  explore = { ...explore, ...value };
}

export { calculateMatches, filteredExploreResults, renderApp };

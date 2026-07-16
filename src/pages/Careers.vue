<template>
  <div class="careers">
    <!-- ============ HERO : culture & who we hire ============ -->
    <header class="hero">
      <div class="hero__inner">
        <p class="eyebrow">Life at WonderBakes</p>
        <h1 class="hero__title">
          We bake the orders.<br />
          Our people bake the trust.
        </h1>
        <p class="hero__lede">
          WonderBakes exists so a home baker in Kasarani can sell to a customer in Kilimani before the icing sets. That only works because of the people running the counter behind the app &mdash; the ones answering a seller's 11pm message, untangling a delivery route, or shipping the fix before a customer even notices the bug.
        </p>
        <div class="hero__values">
          <div class="value">
            <span class="value__mark">01</span>
            <h3>We hire for care, not just skill</h3>
            <p>
              Every role here touches a real baker's income or a real customer's order. We look for people who feel that weight and still move fast.
            </p>
          </div>
          <div class="value">
            <span class="value__mark">02</span>
            <h3>Small team, real ownership</h3>
            <p>
              No layers to hide behind. If you join, your work ships to production and to people's doorsteps &mdash; usually the same week.
            </p>
          </div>
          <div class="value">
            <span class="value__mark">03</span>
            <h3>Kenyan-first, detail-obsessed</h3>
            <p>
              We build for how people actually order, pay, and deliver cake in Kenya &mdash; M-Pesa, boda riders, WhatsApp confirmations, and all.
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- ============ NO VACANCIES : friendly empty state ============ -->
    <section class="tray-section">
      <div class="section-head">
        <p class="eyebrow">Open roles</p>
        <h2>The trays are empty right now</h2>
      </div>
      <div class="empty-case" role="status">
        <div class="empty-case__shelf" aria-hidden="true">
          <span class="slot" v-for="n in 3" :key="n"></span>
        </div>
        <p class="empty-case__text">
          We're not accepting applications at the moment &mdash; there are no open positions to apply for right now. We know that's not the answer you were hoping for, but we'd rather tell you straight than leave a form open with nothing behind it.
        </p>
        <p class="empty-case__sub">
          When a role opens up, we post it on the job boards below before anywhere else. Bookmark one, or check back here.
        </p>
      </div>
    </section>

    <!-- ============ JOB BOARD LINKS ============ -->
    <section class="boards-section">
      <div class="section-head">
        <p class="eyebrow">Where we post</p>
        <h2>Follow our vacancies here</h2>
      </div>
      <div class="boards-grid">
        <a
          v-for="board in jobBoards"
          :key="board.name"
          :href="board.url"
          target="_blank"
          rel="noopener noreferrer"
          class="board-card"
        >
          <span class="board-card__name">{{ board.name }}</span>
          <span class="board-card__url">{{ board.display }}</span>
          <span class="board-card__arrow" aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </section>

    <!-- ============ DEPARTMENTS : modular, extendable ============ -->
    <section class="departments-section">
      <div class="section-head">
        <p class="eyebrow">The teams</p>
        <h2>Who works behind the counter</h2>
        <p class="section-sub">
          Tap a team to see what they actually do day to day. This list is a template &mdash; new teams get added the same way as these three.
        </p>
      </div>

      <div class="departments">
        <article
          v-for="dept in departments"
          :key="dept.id"
          class="dept-card"
          :class="{ 'dept-card--open': openDept === dept.id }"
        >
          <button
            class="dept-card__header"
            :aria-expanded="openDept === dept.id"
            :aria-controls="`dept-panel-${dept.id}`"
            @click="toggleDept(dept.id)"
          >
            <span class="dept-card__icon" v-html="dept.icon"></span>
            <span class="dept-card__title">
              <strong>{{ dept.name }}</strong>
              <span class="dept-card__tagline">{{ dept.tagline }}</span>
            </span>
            <span class="dept-card__chevron" aria-hidden="true">
              {{ openDept === dept.id ? '&minus;' : '+' }}
            </span>
          </button>

          <div
            :id="`dept-panel-${dept.id}`"
            class="dept-card__panel"
            v-show="openDept === dept.id"
          >
            <p class="dept-card__desc">{{ dept.description }}</p>
            <ul class="dept-card__list">
              <li v-for="(item, i) in dept.responsibilities" :key="i">{{ item }}</li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * ---------------------------------------------------------------
 * JOB BOARDS
 * Add or remove entries here to change what's shown in the
 * "Follow our vacancies here" section. No template changes needed.
 * ---------------------------------------------------------------
 */
const jobBoards = ref([
  {
    name: 'MyJobMag',
    display: 'myjobmag.co.ke',
    url: 'https://www.myjobmag.co.ke/',
  },
  {
    name: 'BrighterMonday',
    display: 'brightermonday.co.ke',
    url: 'https://www.brightermonday.co.ke/',
  },
  {
    name: 'KenyaJob',
    display: 'kenyajob.com',
    url: 'https://www.kenyajob.com/',
  },
])

/**
 * ---------------------------------------------------------------
 * DEPARTMENTS
 * This is the modular, extendable part of the page. To add a new
 * department later:
 * 1. Add a new object to this array with a unique `id`.
 * 2. Give it an `icon` (inline SVG string), `name`, `tagline`,
 *    `description`, and a `responsibilities` array.
 * The template loops over this array automatically — nothing else
 * needs to change to add, reorder, or remove a department.
 * ---------------------------------------------------------------
 */
const departments = ref([
  {
    id: 'engineering',
    name: 'Engineering',
    tagline: 'Builds and ships the app',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14.7 6.3a3 3 0 1 0-4.2 4.2L3 18v3h3l7.5-7.5a3 3 0 1 0 4.2-4.2l-1.5-1.5-1.5 1.5z"/></svg>`,
    description: "Engineering owns wonderbakes.shop end to end: the customer app, seller dashboards, and everything running underneath in Supabase and our backend.",
    responsibilities: [
      'Building and maintaining the mobile app and seller dashboards',
      'Designing and evolving the database, auth, and backend services',
      'Wiring up payments (M-Pesa) and delivery logic so orders actually complete',
      'Fixing bugs before sellers or customers hit them, not after',
    ],
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    tagline: 'Gets the order there intact',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z"/><circle cx="7" cy="17" r="1.8"/><circle cx="17.5" cy="17" r="1.8"/></svg>`,
    description: "Logistics makes sure a cake ordered at 9am is still a cake &mdash; not a smudge &mdash; by the time it reaches the door.",
    responsibilities: [
      'Coordinating riders and delivery partners across Nairobi and beyond',
      'Setting realistic delivery windows and handling exceptions',
      'Working with sellers on packaging and handling for fragile items',
      'Tracking delivery performance and fixing the recurring failure points',
    ],
  },
  {
    id: 'operations',
    name: 'Operations & Humanities',
    tagline: 'Keeps sellers and customers looked after',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 20c0-2.5 2.3-4.3 5-4.3S24 17.5 24 20"/></svg>`,
    description: "Operations is the human layer &mdash; onboarding new sellers, resolving disputes, and making sure policy decisions actually make sense for real people.",
    responsibilities: [
      'Onboarding and supporting sellers as they set up their shops',
      'Handling customer support and order disputes with judgement, not just scripts',
      'Shaping policy (refunds, seller standards, quality) as the business grows',
      'Feeding real seller and customer feedback back into product decisions',
    ],
  },
])

const openDept = ref(null)

function toggleDept(id) {
  openDept.value = openDept.value === id ? null : id
}
</script>

<style scoped>
.careers {
  --cocoa: #2f1c14;
  --cocoa-soft: #6b4a37;
  --dough: #f6ede0;
  --dough-deep: #ebdcc7;
  --raspberry: #b7355c;
  --raspberry-deep: #8f2a49;
  --pistachio: #7f9b76;
  --ink: #241511;
  font-family: 'Inter', 'Work Sans', system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--dough);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--raspberry-deep);
  margin: 0 0 0.75rem;
}

h1, h2, h3 {
  font-family: 'Fraunces', Georgia, 'Times New Roman', serif;
  font-weight: 600;
  color: var(--cocoa);
  margin: 0;
}

/* ---------------- HERO ---------------- */
.hero {
  background: var(--cocoa);
  color: var(--dough);
  padding: 4.5rem 1.5rem 4rem;
}

.hero__inner {
  max-width: 880px;
  margin: 0 auto;
}

.hero .eyebrow {
  color: #e7b8c4;
}

.hero__title {
  font-size: clamp(2rem, 4.5vw, 3.1rem);
  line-height: 1.15;
  color: var(--dough);
}

.hero__lede {
  margin-top: 1.5rem;
  font-size: 1.08rem;
  line-height: 1.7;
  max-width: 62ch;
  color: #e8dccb;
}

.hero__values {
  margin-top: 3rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  border-top: 1px solid rgba(246, 237, 224, 0.15);
  padding-top: 2.5rem;
}

.value__mark {
  font-family: 'Fraunces', serif;
  font-size: 0.9rem;
  color: var(--pistachio);
  letter-spacing: 0.05em;
}

.value h3 {
  color: var(--dough);
  font-size: 1.05rem;
  margin: 0.5rem 0 0.5rem;
}

.value p {
  font-size: 0.92rem;
  line-height: 1.6;
  color: #cdbfae;
  margin: 0;
}

@media (max-width: 760px) {
  .hero__values {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }
}

/* ---------------- SECTION SHELL ---------------- */
.tray-section, .boards-section, .departments-section {
  max-width: 880px;
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.section-head h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-top: 0.25rem;
}

.section-sub {
  margin-top: 0.6rem;
  color: var(--cocoa-soft);
  font-size: 0.98rem;
  line-height: 1.6;
  max-width: 60ch;
}

/* ---------------- EMPTY CASE (no vacancies) ---------------- */
.empty-case {
  margin-top: 2rem;
  border: 1px dashed var(--cocoa-soft);
  border-radius: 14px;
  padding: 2.25rem 2rem;
  background: var(--dough-deep);
}

.empty-case__shelf {
  display: flex;
  gap: 0.9rem;
  margin-bottom: 1.5rem;
}

.slot {
  flex: 1;
  height: 44px;
  border: 1.5px dashed rgba(47, 28, 20, 0.35);
  border-radius: 8px;
  background: repeating-linear-gradient(
    135deg,
    rgba(183, 53, 92, 0.05),
    rgba(183, 53, 92, 0.05) 6px,
    transparent 6px,
    transparent 12px
  );
}

.empty-case__text {
  font-size: 1.02rem;
  line-height: 1.65;
  color: var(--ink);
  max-width: 62ch;
}

.empty-case__sub {
  margin-top: 0.75rem;
  font-size: 0.92rem;
  color: var(--cocoa-soft);
}

/* ---------------- JOB BOARDS ---------------- */
.boards-grid {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.board-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1.25rem 1.3rem;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--dough-deep);
  text-decoration: none;
  color: var(--ink);
  position: relative;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.board-card:hover {
  transform: translateY(-2px);
  border-color: var(--raspberry);
}

.board-card:focus-visible {
  outline: 2px solid var(--raspberry);
  outline-offset: 2px;
}

.board-card__name {
  font-weight: 700;
  font-size: 1.02rem;
  color: var(--cocoa);
}

.board-card__url {
  font-size: 0.85rem;
  color: var(--cocoa-soft);
}

.board-card__arrow {
  position: absolute;
  top: 1rem;
  right: 1.1rem;
  color: var(--raspberry);
  font-size: 1rem;
}

@media (max-width: 760px) {
  .boards-grid {
    grid-template-columns: 1fr;
  }
}

/* ---------------- DEPARTMENTS ---------------- */
.departments {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.dept-card {
  border: 1px solid var(--dough-deep);
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.dept-card--open {
  border-color: var(--raspberry);
}

.dept-card__header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.3rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
}

.dept-card__icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--dough);
  color: var(--raspberry-deep);
}

.dept-card__icon svg {
  width: 18px;
  height: 18px;
}

.dept-card__title {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.dept-card__title strong {
  font-family: 'Fraunces', serif;
  font-size: 1.08rem;
  color: var(--cocoa);
}

.dept-card__tagline {
  font-size: 0.85rem;
  color: var(--cocoa-soft);
}

.dept-card__chevron {
  font-size: 1.3rem;
  color: var(--raspberry);
  width: 1.5rem;
  text-align: center;
}

.dept-card__panel {
  padding: 0 1.3rem 1.4rem 4.3rem;
}

.dept-card__desc {
  color: var(--ink);
  line-height: 1.6;
  font-size: 0.96rem;
  margin: 0 0 0.9rem;
}

.dept-card__list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: var(--cocoa-soft);
  font-size: 0.92rem;
  line-height: 1.5;
}

@media (max-width: 600px) {
  .dept-card__panel {
    padding-left: 1.3rem;
  }
}
</style>


import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../Reveal';
import NewsPlate, { PlateDefs } from './NewsPlate';
import {
  BAR,
  CLASSIFIEDS,
  COLOPHON,
  FOLIO,
  FRONT,
  HOUSE_RULES,
  LISTINGS,
  MARQUEE,
  NAMEPLATE,
  SCHEDULE,
  STAGES,
} from './copy';

/**
 * The Playbook, set as a broadsheet.
 *
 * The page it replaced said the same things in cards: four flip-cards for the
 * stages, a grid for the standards, a tab set for the engagement models. The
 * information was right and the form was doing nothing for it — a process
 * described in cards reads as a feature list, and a process described as a front
 * page reads as an argument, which is what this page is for.
 *
 * The whole style is scoped under `.np` in newsprint.css. Nothing on this page
 * touches a token the rest of the site uses, which is what makes it removable in
 * one commit if it turns out to be the wrong idea.
 *
 * Reference: a screen recording of Niccolo Miranda's "Paper Portfolio", supplied
 * by Prashant. The grid, the ink, the paper, the screened pictures and the
 * knockout headlines are taken from its frames rather than from a general idea
 * of what "vintage newspaper" means.
 */

/* One stage, set as an article: kicker, headline against its picture, then the
   body in ruled columns with the boxed output and the pull quote. `flip` swaps
   the headline and the picture so four consecutive articles do not march. */
function Article({ stage, index, flip, knockout }) {
  return (
    <article id={stage.id} className="np-article" aria-labelledby={`${stage.id}-head`}>
      <Reveal variant="fade" className="np-article__slug">
        <p className="np-kicker">{stage.kicker}</p>
        <span aria-hidden="true" className="np-slug-rule" />
        <p className="np-kicker np-kicker--end">{String(index + 1).padStart(2, '0')} / 04</p>
      </Reveal>

      <hr className="np-rule np-rule--heavy" />

      <div className={`np-article__top ${flip ? 'np-article__top--flip' : ''}`}>
        <Reveal variant="up-sm" className="np-article__title">
          <h2 id={`${stage.id}-head`} className="np-display np-display--lg">
            {knockout ? <span className="np-knock">{stage.head}</span> : stage.head}
          </h2>
          <p className="np-deck np-article__deck">{stage.deck}</p>
        </Reveal>

        <Reveal variant="up-sm" delay={90} className="np-article__art">
          <figure className="np-figure">
            <NewsPlate subject={stage.subject} ratio="wide" />
            <figcaption className="np-figcaption">
              <strong>{stage.head}</strong>
              {stage.caption}
              <span className="np-credit">{stage.credit}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <Reveal variant="fade" delay={60} className="np-cols np-cols--3 np-cols--ruled np-article__body">
        <div>
          <p className="np-body np-body--dropcap np-lede">{stage.body[0]}</p>
        </div>
        <div>
          <p className="np-body">{stage.body[1]}</p>
          <div className="np-box np-article__output">
            <span className="np-box__label">What you end up with</span>
            <p className="np-body">{stage.output}</p>
          </div>
        </div>
        <div>
          <blockquote className="np-quote np-quote--flush">
            <p>“{stage.quote}”</p>
            <footer>Where this stage strains</footer>
          </blockquote>
        </div>
      </Reveal>
    </article>
  );
}

/* The listings strip. The row is rendered twice inside one track so the
   translate to -50% lands exactly on the seam and the loop is invisible. */
function Listings({ items, reverse }) {
  return (
    <div className={`np-listings ${reverse ? 'np-listings--reverse' : ''}`}>
      <div className="np-listings__track">
        {[0, 1].map((copy) => (
          <span
            key={copy}
            className="np-listings__group"
            /* The second pass is the same words again so the loop seam is
               invisible; a screen reader should hear the list once. */
            aria-hidden={copy === 1 ? 'true' : undefined}
          >
            {items.map((item) => (
              <span key={item} className="np-listings__item">
                {item}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Broadsheet() {
  return (
    <div className="np">
      <PlateDefs />

      {/* The masthead strip. Deliberately not sticky: the site already carries a
          floating header, and two bars competing for the top of the screen is a
          worse page than one. */}
      <div className="np-bar">
        <span className="np-bar__side">{BAR.left}</span>
        <span className="np-bar__title">{NAMEPLATE}</span>
        <span className="np-bar__side np-bar__side--end">{BAR.right}</span>
      </div>

      <div className="np-page">
        {/* ---------------------------------------------------------------- */}
        {/* THE FRONT PAGE                                                    */}
        {/* ---------------------------------------------------------------- */}
        <header className="np-front">
          <Reveal variant="fade" className="np-front__plate">
            <p className="np-kicker np-front__kicker">{FRONT.kicker}</p>
            <h1 className="np-nameplate np-front__nameplate">{NAMEPLATE}</h1>
            <hr className="np-rule np-rule--double" />
            <ul className="np-folio">
              {FOLIO.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
            <hr className="np-rule np-rule--strong" />
          </Reveal>

          <Reveal variant="up-sm" delay={80} className="np-front__lead">
            <h2 className="np-display np-display--xl np-front__head">
              <span className="np-front__head-line">{FRONT.headTop}</span>
              {/* The second line reverses out of a band that runs the full
                  measure, rather than a box hugging the words. Wrapped type in a
                  tight knockout leaves a ragged right edge on every line; the
                  reference solves it the same way, with one solid band. */}
              <span className="np-front__head-line np-front__head-band">
                {FRONT.headKnock}
              </span>
            </h2>
          </Reveal>

          <hr className="np-rule np-rule--strong np-front__underrule" />

          <div className="np-cols np-cols--3 np-cols--ruled np-front__foot">
            <Reveal variant="fade" delay={40}>
              <p className="np-deck">{FRONT.deck}</p>
              <p className="np-mono np-front__byline">
                {FRONT.byline} — {FRONT.dateline}
              </p>
            </Reveal>

            <Reveal variant="fade" delay={110}>
              <p className="np-body np-body--dropcap">{FRONT.standfirst}</p>
              <p className="np-body np-front__tip">
                <span className="np-runin">Note!</span>
                Every stage below carries the thing that usually goes wrong in it.
              </p>
            </Reveal>

            <Reveal variant="fade" delay={180}>
              <div className="np-stamp">
                {FRONT.stamp.map((row) => (
                  <div key={row.key} className="np-stamp__row">
                    <span className="np-stamp__key">{row.key}:</span>
                    <span className="np-stamp__val">{row.val}</span>
                  </div>
                ))}
              </div>
              <nav className="np-contents" aria-label="Inside this issue">
                <p className="np-kicker np-contents__head">Inside this issue</p>
                <ul>
                  {FRONT.contents.map((item) => (
                    <li key={item.no}>
                      <span className="np-contents__no">{item.no}</span>
                      <span className="np-contents__label">{item.label}</span>
                      <span className="np-contents__note">{item.note}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* THE FOUR STAGES                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="playbook" className="np-band" aria-label="The four stages">
          {STAGES.map((stage, index) => (
            <Article
              key={stage.id}
              stage={stage}
              index={index}
              flip={index % 2 === 1}
              knockout={index === 1 || index === 3}
            />
          ))}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* THE SCHEDULE                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="np-band np-band--tight" aria-label={SCHEDULE.head}>
          <Reveal variant="fade" className="np-section-head">
            <h2 className="np-display np-display--md">{SCHEDULE.head}</h2>
            <p className="np-deck np-section-head__note">{SCHEDULE.note}</p>
          </Reveal>
          <div className="np-schedule">
            {SCHEDULE.stops.map((stop, index) => (
              <Reveal
                key={stop.when}
                variant="up-sm"
                delay={index * 70}
                className="np-schedule__stop"
              >
                <span className="np-schedule__when">{stop.when}</span>
                <span className="np-schedule__what">{stop.what}</span>
                <span className="np-schedule__sub">{stop.sub}</span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* HOUSE RULES                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section id="standards" className="np-band" aria-label={HOUSE_RULES.head}>
          <div className="np-cols np-cols--2 np-houserules">
            <Reveal variant="up-sm">
              <p className="np-kicker">{HOUSE_RULES.kicker}</p>
              <h2 className="np-display np-display--lg np-houserules__head">{HOUSE_RULES.head}</h2>
              <p className="np-deck">{HOUSE_RULES.deck}</p>
              <figure className="np-figure np-houserules__art">
                <NewsPlate subject="build" ratio="wide" fine />
                <figcaption className="np-figcaption">
                  <strong>The forme</strong>
                  Locked up, proofed and pulled. Nothing goes to press on the strength of good
                  intentions.
                  <span className="np-credit">Engraving — EKA Solution</span>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal variant="fade" delay={90}>
              <div className="np-rulelist">
                {HOUSE_RULES.rules.map((rule) => (
                  <div key={rule.num} className="np-rulelist__item">
                    <span className="np-rulelist__num">{rule.num}</span>
                    <div>
                      <h3 className="np-rulelist__rule">{rule.rule}</h3>
                      <p className="np-body">{rule.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* THE LISTINGS — full bleed, like a market page                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="np-band--tight np-listings-band" aria-label={LISTINGS.head}>
        <div className="np-page">
          <p className="np-kicker np-listings__head">{LISTINGS.head}</p>
          <p className="np-body np-listings__note">{LISTINGS.note}</p>
        </div>
        <Listings items={LISTINGS.rows[0]} />
        <Listings items={LISTINGS.rows[1]} reverse />
      </section>

      <div className="np-page">
        {/* ---------------------------------------------------------------- */}
        {/* THE CLASSIFIEDS                                                   */}
        {/* ---------------------------------------------------------------- */}
        <section id="engagement" className="np-band" aria-label={CLASSIFIEDS.head}>
          <Reveal variant="fade" className="np-section-head np-section-head--split">
            <div>
              <p className="np-kicker">{CLASSIFIEDS.kicker}</p>
              <h2 className="np-display np-display--lg">{CLASSIFIEDS.head}</h2>
            </div>
            <p className="np-deck">{CLASSIFIEDS.deck}</p>
          </Reveal>

          <div className="np-cols np-cols--4 np-cols--ruled np-classifieds">
            {CLASSIFIEDS.ads.map((ad, index) => (
              <Reveal key={ad.id} variant="up-sm" delay={index * 70} className="np-classified">
                <h3 className="np-classified__head">{ad.head}</h3>
                <p className="np-classified__tagline">{ad.tagline}</p>
                <div className="np-meta">
                  {ad.meta.map(([key, val]) => (
                    <React.Fragment key={key}>
                      <span className="np-meta__key">{key}</span>
                      <span className="np-meta__val">{val}</span>
                    </React.Fragment>
                  ))}
                </div>
                <p className="np-body np-classified__summary">{ad.summary}</p>
                <ul className="np-list">
                  {ad.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="np-classified__notfor">
                  <span className="np-runin">Not for</span>
                  {ad.notFor}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* THE BACK PAGE                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="np-marquee" aria-hidden="true">
        <div className="np-marquee__track">
          {[0, 1].map((copy) => (
            <span key={copy} className="np-marquee__group">
              <span className="np-marquee__word">{MARQUEE}</span>
              <span className="np-marquee__word np-knock">Start here</span>
            </span>
          ))}
        </div>
      </div>

      <div className="np-page">
        <section className="np-band--tight np-backpage" aria-label="Start a conversation">
          <div className="np-cols np-cols--2 np-cols--ruled">
            <Reveal variant="up-sm">
              <h2 className="np-display np-display--md">{COLOPHON.cta.head}</h2>
              <p className="np-body np-backpage__body">{COLOPHON.cta.body}</p>
              <Link to="/contact" className="np-coupon">
                {COLOPHON.cta.label}
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>

            <Reveal variant="fade" delay={80}>
              <div className="np-colophon np-colophon--stack">
                {COLOPHON.imprint.map((entry) => (
                  <div key={entry.title}>
                    <p className="np-kicker">{entry.title}</p>
                    <p className="np-body np-colophon__body">{entry.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </div>
  );
}

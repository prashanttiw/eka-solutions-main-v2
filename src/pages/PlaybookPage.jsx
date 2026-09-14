import React from 'react';
import Broadsheet from '../components/broadsheet/Broadsheet';
import PageNav from '../components/PageNav';
import '../newsprint.css';

/**
 * The Playbook, set as a broadsheet newspaper.
 *
 * This route used to compose the site's standard furniture — PageHeader, then
 * the Playbook cards, the standards grid and the engagement tabs. Those
 * components are still in the tree and still correct; they are simply not what
 * this page renders any more. Restoring them is a three-line change, which is
 * deliberate: the newspaper treatment is a bet, and a bet should be cheap to
 * unwind. See `.playbook-newspaper-backup/RESTORE.sh`.
 *
 * PageNav stays outside the paper. The story order — Home, About, Services,
 * Work, Playbook, Contact — is a site-wide rule rather than a page decoration,
 * and dropping the reader out of the broadsheet and back onto the site's own
 * paper at the end is a cleaner ending than a pastiche of one.
 */
export default function PlaybookPage() {
  return (
    <>
      <Broadsheet />
      <PageNav />
    </>
  );
}

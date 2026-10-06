import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRight, Flame, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useProfile from '@/lib/useProfile';
import useStudyLogs from '@/lib/useStudyLogs';
import { CURRICULUM } from '@/lib/curriculum';
import { todaysTask } from '@/lib/daily';
import StudyCalendar from '@/components/home/StudyCalendar';
import LangSwitch from '@/components/home/LangSwitch';
import TodayCard from '@/components/home/TodayCard';
import GuideEnvelope from '@/components/home/GuideEnvelope';
import { SparkleDoodle } from '@/components/deco/DoodleDeco';
import Tape from '@/components/deco/Tape';

// HOME — a magazine masthead, not a dashboard:
// left-set oversized serif, a ruled-paper spread for "continue",
// one sticky note for today's mission. Everything else lives behind the tabs.
export default function Home() {
  const { user, save } = useProfile();
  const { logs, doneToday, doneDays, streak, refetch } = useStudyLogs(user);
  const name = user.display_name || user.full_name || 'you';
  const lessons = CURRICULUM[user.level] || [];

  const [prog, setProg] = useState(null);
  useEffect(() => {
    let live = true;
    base44.entities.LessonProgress.filter({ level: user.level, completed: true }).then((r) => {
      const arr = Array.isArray(r) ? r : r.items;
      if (live) setProg(arr || []);
    });
    return () => { live = false; };
  }, [user.level]);

  const doneNums = new Set((prog || []).map((p) => p.lesson_number));
  let nextNum = 1;
  while (doneNums.has(nextNum) && nextNum < lessons.length) nextNum++;
  const next = lessons[nextNum - 1];
  const task = todaysTask(user.language);

  return (
    <div>
      {/* ——— masthead: thin rules, giant serif, left-set ——— */}
      <header>
        <div className="flex items-baseline justify-between border-b border-wine/25 pb-1">
          <span className="font-pixel text-base uppercase tracking-[0.3em] text-wine/50">no. {doneNums.size + 1} — {format(new Date(), 'MMM')}</span>
          <span className="font-pixel text-base uppercase tracking-[0.3em] text-wine/50">{format(new Date(), 'EEE d')}</span>
        </div>
        <p className="mt-5 font-script text-3xl leading-none text-wine">SUYN's <SparkleDoodle size={14} className="inline rotate-12" /></p>
        <p className="-mt-0.5 font-pixel text-base tracking-[0.22em] text-primary">weallarelearninglanguageright</p>
        <h1 className="mt-3 font-display text-6xl italic leading-[0.92] text-wine md:text-7xl">hi,<br />{name}.</h1>
        <p className="mt-3 flex items-center gap-1.5 font-hand text-xl text-wine/70">
          <Flame size={15} className="text-primary" /> {streak}-day streak — keep it alive ♡
        </p>
      </header>

      <div className="mt-6">
        <LangSwitch user={user} save={save} />
      </div>

      {/* ——— continue learning: a ruled-paper spread, slightly askew ——— */}
      {prog === null ? (
        <div className="mt-10 flex h-44 items-center justify-center rounded-sm border border-wine/20 bg-parchment sticker">
          <Loader2 size={18} className="animate-spin text-primary" />
        </div>
      ) : next ? (
        <section className="mt-12">
          <div className="paper-lines relative -rotate-1 rounded-sm border border-wine/20 p-6 pt-9 sticker">
            <Tape className="-top-3 left-10 -rotate-6" />
            <span aria-hidden className="absolute right-3 top-2 select-none font-display text-7xl italic leading-none text-wine/10">
              {String(nextNum).padStart(2, '0')}
            </span>
            <p className="font-pixel text-base uppercase tracking-[0.3em] text-primary">continue learning</p>
            <p className="mt-0.5 font-pixel text-base text-wine/50">lesson {nextNum} of {lessons.length}</p>
            <Link to={`/lessons/${nextNum}`} className="group mt-3 block">
              <h2 className="font-display text-5xl italic leading-[1.02] text-wine md:text-6xl">{next.title}</h2>
              <span className="mt-5 inline-flex items-center gap-2 border-b-2 border-primary pb-0.5 font-pixel text-lg uppercase tracking-widest text-wine transition group-hover:text-primary">
                open lesson <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ——— today's mission: a butter sticky note, pinned off-axis ——— */}
      <section className="mt-12 flex justify-end">
        <div className="relative w-64 rotate-2 rounded-sm bg-butter p-4 pr-5 pt-6 shadow-[2px_3px_0_0_hsl(24_40%_20%_/_0.15)]">
          <Tape className="-top-2.5 left-1/2 -translate-x-1/2 -rotate-2" />
          <p className="font-pixel text-base uppercase tracking-[0.28em] text-wine/60">today's mission</p>
          <p className="mt-1 font-hand text-xl leading-snug text-wine">{task}</p>
          <Link to="/corner" className="group mt-2 inline-flex items-center gap-1.5 font-hand text-lg text-wine/70 underline decoration-wine/30 underline-offset-4 transition hover:text-wine">
            write it in your scrapbook <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <div className="mt-12 space-y-10">
        <TodayCard streak={streak} doneToday={doneToday} />
        <StudyCalendar logs={logs} doneDays={doneDays} streak={streak} onChange={refetch} />
        <GuideEnvelope />
      </div>
    </div>
  );
}

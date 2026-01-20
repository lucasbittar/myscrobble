"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { GlowText } from "@/components/crt";
import { useTourStatusBatch } from "@/hooks/useTourStatus";
import { useGeolocation } from "@/hooks/useGeolocation";
import type { TourEvent } from "@/types/tour";

interface UpcomingConcertsProps {
  topArtists: Array<{
    id: string;
    name: string;
  }>;
}

interface ConcertWithArtist extends TourEvent {
  artistName: string;
}

export function UpcomingConcerts({ topArtists }: UpcomingConcertsProps) {
  const t = useTranslations("tour");
  const tCommon = useTranslations("common");
  const { location, loading: locationLoading } = useGeolocation();

  const artistNames = topArtists.slice(0, 5).map((a) => a.name);

  const { data: tourData, isLoading } = useTourStatusBatch(
    artistNames,
    location?.lat,
    location?.lng
  );

  // Combine all events from all artists, deduplicate, and sort by date
  const concertsMap = new Map<string, ConcertWithArtist>();
  if (tourData) {
    for (const [artistName, status] of Object.entries(tourData)) {
      for (const event of status.events) {
        // Create unique key: artist + date (ignore venue differences for same day)
        const dateKey = event.date.split('T')[0]; // Use only date part
        const uniqueKey = `${artistName}-${dateKey}`;

        // Only add if not already present (keeps first occurrence)
        if (!concertsMap.has(uniqueKey)) {
          concertsMap.set(uniqueKey, { ...event, artistName });
        }
      }
    }
  }

  // Convert to array, sort by date, and take first 5
  const displayConcerts = Array.from(concertsMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  if (isLoading || locationLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-terminal text-xl">
            <GlowText color="magenta" size="sm">
              <span className="text-muted-foreground">◈</span> {t("upcoming")}
            </GlowText>
          </h2>
        </div>
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="w-2 h-2 rounded-full bg-[var(--crt-magenta)]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-terminal text-sm text-muted-foreground">
              {t("searching")}
            </span>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-terminal text-xl">
            <GlowText color="magenta" size="sm">
              <span className="text-muted-foreground">◈</span> {t("upcoming")}
            </GlowText>
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[var(--crt-magenta)]/10 font-mono text-[10px] text-[var(--crt-magenta)] uppercase">
            {t("nearYou")}
          </span>
        </div>
        <Link
          href="/dashboard/concerts"
          className="font-mono text-sm text-muted-foreground hover:text-[var(--crt-magenta)] transition-colors"
        >
          {tCommon("viewAll")}
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--crt-magenta)]/20 bg-card overflow-hidden">
        {displayConcerts.length > 0 ? (
          <div className="divide-y divide-[var(--crt-magenta)]/10">
            {displayConcerts.map((concert, index) => (
              <motion.div
                key={`${concert.artistName}-${concert.date}-${concert.venue}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative flex items-center gap-4 p-4 hover:bg-[var(--crt-magenta)]/5 transition-all"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[var(--crt-magenta)]/10 border border-[var(--crt-magenta)]/30 flex flex-col items-center justify-center">
                  <span className="font-terminal text-lg text-[var(--crt-magenta)] leading-none">
                    {new Date(concert.date).getDate()}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--crt-magenta)]/70 uppercase">
                    {new Date(concert.date).toLocaleDateString(undefined, {
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Concert info */}
                <div className="flex-1 min-w-0">
                  <p className="font-terminal text-sm text-foreground truncate group-hover:text-[var(--crt-magenta)] transition-colors">
                    {concert.artistName}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {concert.venue}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/70 truncate">
                    {concert.city}
                  </p>
                </div>

                {/* Distance badge */}
                {concert.distanceKm !== undefined && (
                  <div className="flex-shrink-0 px-2 py-1 rounded-full bg-[var(--crt-magenta)]/10 border border-[var(--crt-magenta)]/20">
                    <span className="font-mono text-xs text-[var(--crt-magenta)]">
                      {t("kmAway", { distance: concert.distanceKm })}
                    </span>
                  </div>
                )}

                {/* Ticket link indicator */}
                {concert.ticketUrl && (
                  <a
                    href={concert.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[var(--crt-magenta)] text-background font-terminal text-xs hover:brightness-110 transition-all"
                    style={{
                      boxShadow: "0 0 10px var(--crt-magenta)",
                    }}
                  >
                    {tCommon("tickets")}
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl opacity-30">♪</div>
            <p className="font-terminal text-sm text-muted-foreground mb-2">
              {t("noUpcoming")}
            </p>
            <p className="font-mono text-xs text-muted-foreground/70">
              {t("fromTopArtists")}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

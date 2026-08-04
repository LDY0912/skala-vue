import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

const token = process.env.PANDASCORE_API_TOKEN?.trim()
const apiBaseUrl = 'https://api.pandascore.co/valorant/matches'

if (!token) {
  throw new Error('PANDASCORE_API_TOKEN이 설정되지 않았습니다.')
}

function normalizeOpponent(entry) {
  const opponent = entry?.opponent
  if (!opponent) return null

  return {
    id: opponent.id,
    name: opponent.name,
    acronym: opponent.acronym,
    imageUrl: opponent.image_url,
    location: opponent.location,
  }
}

function normalizeMatch(match) {
  return {
    id: match.id,
    slug: match.slug,
    name: match.name,
    status: match.status,
    matchType: match.match_type,
    numberOfGames: match.number_of_games,
    scheduledAt: match.scheduled_at,
    beginAt: match.begin_at,
    endAt: match.end_at,
    winnerId: match.winner_id,
    opponents: (match.opponents ?? []).map(normalizeOpponent).filter(Boolean),
    results: (match.results ?? []).map((result) => ({
      teamId: result.team_id,
      score: result.score,
    })),
    league: match.league
      ? {
          id: match.league.id,
          name: match.league.name,
          slug: match.league.slug,
          imageUrl: match.league.image_url,
        }
      : null,
    serie: match.serie
      ? {
          id: match.serie.id,
          name: match.serie.name,
          fullName: match.serie.full_name,
          year: match.serie.year,
        }
      : null,
    tournament: match.tournament
      ? {
          id: match.tournament.id,
          name: match.tournament.name,
          slug: match.tournament.slug,
        }
      : null,
    streams: (match.streams_list ?? [])
      .filter((stream) => stream.raw_url)
      .map((stream) => ({
        url: stream.raw_url,
        language: stream.language,
        main: stream.main,
        official: stream.official,
      })),
  }
}

async function fetchMatches(scope, sort) {
  const url = new URL(`${apiBaseUrl}/${scope}`)
  url.searchParams.set('per_page', '60')
  url.searchParams.set('sort', sort)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PandaScore ${scope} 요청 실패 (${response.status}): ${detail}`)
  }

  const matches = await response.json()
  return matches.map(normalizeMatch)
}

const [upcoming, running, past] = await Promise.all([
  fetchMatches('upcoming', 'scheduled_at'),
  fetchMatches('running', 'scheduled_at'),
  fetchMatches('past', '-scheduled_at'),
])

const payload = {
  fetchedAt: new Date().toISOString(),
  source: 'PandaScore',
  upcoming,
  running,
  past,
}

const outputDirectory = resolve('public/data')
const outputPath = resolve(outputDirectory, 'valorant-schedule.json')
await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(
  `Valorant 일정 저장 완료: 예정 ${upcoming.length}, 진행 ${running.length}, 종료 ${past.length}`,
)

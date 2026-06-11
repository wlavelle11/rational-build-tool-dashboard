import { NextResponse } from 'next/server'

// Triggers the Rational Pipeline service on Railway by redeploying its
// latest image (the container runs the pipeline once and exits).
// Status is derived from the latest Railway deployment. Railway marks a
// deployment SUCCESS as soon as the container starts, so we treat a young
// SUCCESS as still running — the pipeline takes ~10 minutes end to end.

const RAILWAY_API = 'https://backboard.railway.com/graphql/v2'
const RUN_WINDOW_MS = 12 * 60 * 1000

const projectId = process.env.RAILWAY_PROJECT_ID
const environmentId = process.env.RAILWAY_ENVIRONMENT_ID
const serviceId = process.env.RAILWAY_SERVICE_ID

const ACTIVE_STATUSES = new Set(['QUEUED', 'WAITING', 'BUILDING', 'DEPLOYING', 'INITIALIZING'])

async function railwayQuery(query: string, variables: Record<string, unknown>) {
  const res = await fetch(RAILWAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Project-Access-Token': process.env.RAILWAY_TOKEN ?? '',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors[0].message)
  return data.data
}

async function latestDeployment(): Promise<{ status: string; createdAt: string } | null> {
  const data = await railwayQuery(
    `query ($input: DeploymentListInput!) {
      deployments(input: $input, first: 1) {
        edges { node { status createdAt } }
      }
    }`,
    { input: { projectId, environmentId, serviceId } },
  )
  return data.deployments.edges[0]?.node ?? null
}

function toRunState(dep: { status: string; createdAt: string } | null) {
  if (!dep) return { running: false, lastRunAt: null, lastRunResult: null }
  const age = Date.now() - new Date(dep.createdAt).getTime()
  const running =
    ACTIVE_STATUSES.has(dep.status) || (dep.status === 'SUCCESS' && age < RUN_WINDOW_MS)
  return {
    running,
    lastRunAt: dep.createdAt,
    lastRunResult: running ? null : (['FAILED', 'CRASHED'].includes(dep.status) ? 'error' : 'success'),
  }
}

export async function GET() {
  try {
    return NextResponse.json(toRunState(await latestDeployment()))
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  try {
    const state = toRunState(await latestDeployment())
    if (state.running) {
      return NextResponse.json({ running: true, message: 'Pipeline already running' })
    }

    await railwayQuery(
      `mutation ($environmentId: String!, $serviceId: String!) {
        serviceInstanceRedeploy(environmentId: $environmentId, serviceId: $serviceId)
      }`,
      { environmentId, serviceId },
    )

    return NextResponse.json({ started: true, message: 'Pipeline started — leads will sync in ~10 minutes' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

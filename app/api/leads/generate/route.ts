import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import os from 'os'

const PIPELINE_DIR = path.join(os.homedir(), 'rational-pipeline')
const PYTHON_BIN   = path.join(PIPELINE_DIR, 'venv', 'bin', 'python3')
const PIPELINE_SCRIPT = path.join(PIPELINE_DIR, 'pipeline.py')

let runningPid: number | null = null

export async function GET() {
  return NextResponse.json({ running: runningPid !== null, pid: runningPid })
}

export async function POST() {
  if (runningPid !== null) {
    return NextResponse.json({ running: true, pid: runningPid, message: 'Pipeline already running' })
  }

  try {
    const child = spawn(PYTHON_BIN, [PIPELINE_SCRIPT], {
      cwd: PIPELINE_DIR,
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, HOME: os.homedir() },
    })

    runningPid = child.pid ?? null

    child.on('close', () => { runningPid = null })
    child.on('error', () => { runningPid = null })
    child.unref()

    return NextResponse.json({ started: true, pid: runningPid, message: 'Pipeline started — leads will sync in ~10 minutes' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

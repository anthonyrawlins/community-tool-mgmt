import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check for frontend
    const health = {
      success: true,
      message: 'Ballarat Tool Library Frontend is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        frontend: 'healthy',
        api: process.env.NEXT_PUBLIC_API_URL || 'not configured'
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
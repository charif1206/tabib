import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { id, role } = session;
    const collection = role === 'doctor' ? 'doctors' : 'users';
    const docRef = await adminDb.collection(collection).doc(id).get();
    
    if (!docRef.exists) {
       return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const data = docRef.data()!;
    // Remove password from response
    const { password, ...userWithoutPassword } = data;

    return NextResponse.json({
      authenticated: true,
      user: {
        id,
        role,
        ...userWithoutPassword
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

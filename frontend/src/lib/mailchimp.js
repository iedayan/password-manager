export async function subscribeToWaitlist(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Valid email is required');
  }

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'waitlist',
        email: email
      })
    });

    if (!response.ok) {
      throw new Error('Subscription failed');
    }

    return { success: true, message: 'Successfully joined waitlist!' };
  } catch (error) {
    throw new Error(error.message || 'Network error');
  }
}
const TOKEN_NAME = 'atlas_admin_token';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const cookieParts = [
    `${TOKEN_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isProd) cookieParts.push('Secure');

  res.setHeader('Set-Cookie', cookieParts.join('; '));
  return res.status(200).json({ success: true });
}

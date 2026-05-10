import { prisma } from './src/lib/prisma';
import jwt from 'jsonwebtoken';

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log('No user'); return; }
  let exam = await prisma.mockExam.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  
  if (!exam) {
    exam = await prisma.mockExam.create({
      data: {
        userId: user.id,
        title: 'Teste',
        totalQuestions: 10,
        config: '{}'
      }
    });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback-secret-change-me', { expiresIn: '7d' });
  
  console.log('ID:', exam.id);
  console.log('TOKEN:', token);
  
  try {
    const res = await fetch(`http://localhost:8080/api/simulados/${exam.id}/start`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
}
main().catch(console.error).finally(() => process.exit(0));

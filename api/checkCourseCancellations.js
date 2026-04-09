import 'dotenv/config';
import { checkAndCancelCourses } from './src/services/courseCancellationService.js';

console.log('=== Vérification automatique des cours ===\n');

try {
  const result = await checkAndCancelCourses();
  console.log('\n✅ Processus terminé avec succès');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur:', error);
  process.exit(1);
}

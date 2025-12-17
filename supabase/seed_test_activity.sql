-- ============================================
-- SEED DATA: Test Activity Logs
-- Execute this manually in Supabase SQL Editor
-- Replace 'YOUR_USER_ID' with your actual user ID
-- ============================================

-- First, get your user ID from user_profiles:
-- SELECT id, email FROM user_profiles LIMIT 5;

-- Then replace 'YOUR_USER_ID' below with your actual UUID

DO $$
DECLARE
  v_user_id 'ece485cb-2fe9-41ea-a8f7-e985ca0e52ae';
BEGIN
  -- Get the first user (or specify your user ID)
  SELECT id INTO v_user_id FROM public.user_profiles LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in user_profiles. Create a user first.';
  END IF;

  RAISE NOTICE 'Inserting test data for user: %', v_user_id;

  -- Clear existing test data for this user
  DELETE FROM public.activity_logs WHERE user_id = v_user_id;

  -- Insert varied test activity over the last 14 days
  INSERT INTO public.activity_logs (
    user_id, activity_type, content_preview, content_length,
    source_url, source_title, notion_page_id, notion_page_title,
    notion_database_id, notion_database_name, sections_selected,
    sections_count, has_files, file_names, files_count, total_file_size,
    created_at
  ) VALUES
  -- Day 1 (today)
  (v_user_id, 'clip_sent', 'Article sur les meilleures pratiques de développement React en 2025...', 2450,
   'https://dev.to/react-best-practices-2025', 'React Best Practices 2025',
   'page_001', 'Notes de développement', 'db_001', 'Knowledge Base',
   ARRAY['Introduction', 'Hooks avancés', 'Performance'], 3,
   false, NULL, 0, 0, NOW() - INTERVAL '2 hours'),

  (v_user_id, 'file_uploaded', NULL, 0,
   NULL, NULL, 'page_002', 'Ressources Design', 'db_001', 'Knowledge Base',
   NULL, 0, true, ARRAY['mockup-v2.fig', 'design-system.pdf'], 2, 4500000,
   NOW() - INTERVAL '4 hours'),

  (v_user_id, 'clip_sent', 'Guide complet sur TypeScript 5.0 avec les nouvelles fonctionnalités...', 3200,
   'https://typescript.org/docs/5.0', 'TypeScript 5.0 Guide',
   'page_003', 'Documentation Tech', 'db_002', 'Tech Docs',
   ARRAY['Nouveautés', 'Decorators', 'Const Type Parameters'], 3,
   true, ARRAY['typescript-cheatsheet.pdf'], 1, 250000,
   NOW() - INTERVAL '6 hours'),

  -- Day 2 (yesterday)
  (v_user_id, 'selection_saved', 'Extrait important sur la gestion d''état avec Zustand...', 890,
   'https://zustand.docs.pmnd.rs/', 'Zustand Documentation',
   'page_004', 'State Management', 'db_002', 'Tech Docs',
   ARRAY['Quick Start', 'Middleware'], 2,
   false, NULL, 0, 0, NOW() - INTERVAL '1 day' - INTERVAL '3 hours'),

  (v_user_id, 'clip_sent', 'Tutoriel Supabase avec authentification et RLS policies...', 4100,
   'https://supabase.com/docs/guides/auth', 'Supabase Auth Guide',
   'page_005', 'Backend Notes', 'db_001', 'Knowledge Base',
   ARRAY['Setup', 'OAuth Providers', 'RLS Policies', 'Best Practices'], 4,
   false, NULL, 0, 0, NOW() - INTERVAL '1 day' - INTERVAL '8 hours'),

  -- Day 3
  (v_user_id, 'bulk_export', 'Export de 15 articles sur le machine learning...', 45000,
   'https://arxiv.org/list/cs.LG/recent', 'ArXiv ML Papers',
   'page_006', 'ML Research', 'db_003', 'Research Papers',
   ARRAY['Abstract', 'Introduction', 'Methods', 'Results', 'Conclusion'], 5,
   true, ARRAY['paper1.pdf', 'paper2.pdf', 'paper3.pdf'], 3, 12000000,
   NOW() - INTERVAL '2 days' - INTERVAL '5 hours'),

  (v_user_id, 'clip_sent', 'Notes de réunion sur le planning Q1 2025...', 1200,
   NULL, 'Meeting Notes - Q1 Planning',
   'page_007', 'Réunions', 'db_004', 'Work',
   ARRAY['Objectifs', 'Timeline', 'Ressources'], 3,
   false, NULL, 0, 0, NOW() - INTERVAL '2 days' - INTERVAL '10 hours'),

  -- Day 4
  (v_user_id, 'file_uploaded', NULL, 0,
   NULL, NULL, 'page_008', 'Assets Projet', 'db_004', 'Work',
   NULL, 0, true, ARRAY['logo-final.svg', 'brand-colors.json'], 2, 85000,
   NOW() - INTERVAL '3 days' - INTERVAL '2 hours'),

  (v_user_id, 'clip_sent', 'Documentation API Stripe pour l''intégration des paiements...', 5600,
   'https://stripe.com/docs/api', 'Stripe API Reference',
   'page_009', 'Intégrations', 'db_002', 'Tech Docs',
   ARRAY['Authentication', 'Customers', 'Subscriptions', 'Webhooks'], 4,
   false, NULL, 0, 0, NOW() - INTERVAL '3 days' - INTERVAL '7 hours'),

  -- Day 5
  (v_user_id, 'selection_saved', 'Citation importante sur l''architecture hexagonale...', 450,
   'https://blog.cleancoder.com/hexagonal', 'Clean Architecture Blog',
   'page_010', 'Architecture', 'db_002', 'Tech Docs',
   ARRAY['Core Concept'], 1,
   false, NULL, 0, 0, NOW() - INTERVAL '4 days' - INTERVAL '4 hours'),

  (v_user_id, 'clip_sent', 'Recette de cookies aux pépites de chocolat parfaits...', 1800,
   'https://cooking.nytimes.com/recipes/cookies', 'NYT Cooking - Cookies',
   'page_011', 'Recettes', 'db_005', 'Personal',
   ARRAY['Ingrédients', 'Instructions', 'Tips'], 3,
   true, ARRAY['cookies-photo.jpg'], 1, 320000,
   NOW() - INTERVAL '4 days' - INTERVAL '9 hours'),

  -- Day 6
  (v_user_id, 'clip_sent', 'Article sur les tendances UX/UI 2025...', 3400,
   'https://uxdesign.cc/trends-2025', 'UX Design Trends 2025',
   'page_012', 'Design Inspiration', 'db_006', 'Design',
   ARRAY['Micro-interactions', 'Dark Mode', 'Accessibility', '3D Elements'], 4,
   false, NULL, 0, 0, NOW() - INTERVAL '5 days' - INTERVAL '3 hours'),

  -- Day 7
  (v_user_id, 'page_created', 'Nouvelle page de projet créée pour le redesign...', 0,
   NULL, NULL, 'page_013', 'Redesign Dashboard', 'db_004', 'Work',
   NULL, 0, false, NULL, 0, 0, NOW() - INTERVAL '6 days' - INTERVAL '6 hours'),

  (v_user_id, 'clip_sent', 'Guide Tailwind CSS avec les nouvelles classes v4...', 2900,
   'https://tailwindcss.com/docs/v4', 'Tailwind CSS v4 Docs',
   'page_014', 'CSS Framework', 'db_002', 'Tech Docs',
   ARRAY['Installation', 'Configuration', 'New Features'], 3,
   false, NULL, 0, 0, NOW() - INTERVAL '6 days' - INTERVAL '11 hours'),

  -- Day 8-14 (more varied data)
  (v_user_id, 'clip_sent', 'Podcast notes sur la productivité et le deep work...', 2100,
   'https://hubermanlab.com/deep-work', 'Huberman Lab - Deep Work',
   'page_015', 'Productivity', 'db_005', 'Personal',
   ARRAY['Key Insights', 'Action Items'], 2,
   false, NULL, 0, 0, NOW() - INTERVAL '7 days'),

  (v_user_id, 'file_uploaded', NULL, 0,
   NULL, NULL, 'page_016', 'Contracts', 'db_004', 'Work',
   NULL, 0, true, ARRAY['contract-2025.pdf', 'nda-signed.pdf'], 2, 890000,
   NOW() - INTERVAL '8 days'),

  (v_user_id, 'clip_sent', 'Analyse comparative des frameworks JavaScript...', 4200,
   'https://stateofjs.com/2024', 'State of JS 2024',
   'page_017', 'Tech Analysis', 'db_002', 'Tech Docs',
   ARRAY['React', 'Vue', 'Svelte', 'Solid', 'Conclusion'], 5,
   false, NULL, 0, 0, NOW() - INTERVAL '9 days'),

  (v_user_id, 'selection_saved', 'Quote inspirante sur l''entrepreneuriat...', 280,
   'https://twitter.com/naval', 'Naval Ravikant Tweet',
   'page_018', 'Quotes', 'db_005', 'Personal',
   ARRAY['Quote'], 1,
   false, NULL, 0, 0, NOW() - INTERVAL '10 days'),

  (v_user_id, 'clip_sent', 'Documentation Next.js 15 avec Server Components...', 5100,
   'https://nextjs.org/docs/15', 'Next.js 15 Documentation',
   'page_019', 'Frameworks', 'db_002', 'Tech Docs',
   ARRAY['App Router', 'Server Components', 'Data Fetching', 'Caching'], 4,
   true, ARRAY['nextjs-diagram.png'], 1, 180000,
   NOW() - INTERVAL '11 days'),

  (v_user_id, 'bulk_export', 'Export de bookmarks Chrome vers Notion...', 8500,
   NULL, 'Chrome Bookmarks Export',
   'page_020', 'Bookmarks Archive', 'db_001', 'Knowledge Base',
   ARRAY['Tech', 'Design', 'Business', 'Personal'], 4,
   false, NULL, 0, 0, NOW() - INTERVAL '12 days'),

  (v_user_id, 'clip_sent', 'Article sur les bonnes pratiques Git et GitHub...', 3800,
   'https://github.blog/git-best-practices', 'GitHub Blog - Git Tips',
   'page_021', 'Git Workflow', 'db_002', 'Tech Docs',
   ARRAY['Branching', 'Commits', 'PR Reviews', 'CI/CD'], 4,
   false, NULL, 0, 0, NOW() - INTERVAL '13 days'),

  (v_user_id, 'file_uploaded', NULL, 0,
   NULL, NULL, 'page_022', 'Presentations', 'db_004', 'Work',
   NULL, 0, true, ARRAY['pitch-deck-v3.pptx', 'demo-video.mp4'], 2, 45000000,
   NOW() - INTERVAL '14 days');

  RAISE NOTICE 'Successfully inserted 24 test activity records';
END $$;

-- Verify the data
SELECT 
  activity_type,
  COUNT(*) as count,
  SUM(CASE WHEN has_files THEN 1 ELSE 0 END) as with_files
FROM public.activity_logs
GROUP BY activity_type
ORDER BY count DESC;

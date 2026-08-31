CREATE OR REPLACE FUNCTION public.publish_daily_quiz_v1(
  p_question text,
  p_option_a text,
  p_option_b text,
  p_option_c text,
  p_correct_option text,
  p_explanation text,
  p_xp_reward integer
)
RETURNS public.daily_quizzes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $$
DECLARE
  result public.daily_quizzes;
  next_sort_order integer;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_super_admin() THEN
    RAISE EXCEPTION 'Only Super Admin may publish Daily Quiz' USING ERRCODE = '42501';
  END IF;
  IF char_length(trim(p_question)) NOT BETWEEN 5 AND 1000
    OR char_length(trim(p_option_a)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_option_b)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_option_c)) NOT BETWEEN 1 AND 300
    OR char_length(trim(p_explanation)) NOT BETWEEN 5 AND 2000
    OR p_correct_option NOT IN ('A', 'B', 'C')
    OR p_xp_reward NOT BETWEEN 0 AND 1000
    OR p_question ~* '[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}'
    OR p_question ~ '(\+?84|0)[0-9]{8,10}' THEN
    RAISE EXCEPTION 'Invalid Daily Quiz payload' USING ERRCODE = '22023';
  END IF;
  UPDATE public.daily_quizzes SET is_active = false, updated_at = timezone('utc'::text, now()) WHERE is_active = true;
  SELECT COALESCE(MAX(sort_order), 0) + 1 INTO next_sort_order FROM public.daily_quizzes;
  INSERT INTO public.daily_quizzes (
    code, question, option_a, option_b, option_c, correct_option, explanation, xp_reward, sort_order, is_active, updated_at
  ) VALUES (
    format('Q-%s-%s', to_char(timezone('utc'::text, now()), 'YYYYMMDD'), substr(gen_random_uuid()::text, 1, 6)),
    trim(p_question), trim(p_option_a), trim(p_option_b), trim(p_option_c), p_correct_option, trim(p_explanation), p_xp_reward, next_sort_order, true, timezone('utc'::text, now())
  ) RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.publish_daily_quiz_v1(text, text, text, text, text, text, integer) TO authenticated;

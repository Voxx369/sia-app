import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './App.css'

const Home = lazy(() => import('./pages/Home'))
const Signup = lazy(() => import('./pages/Signup'))
const Login = lazy(() => import('./pages/login'))
const ArtCourses = lazy(() => import('./pages/ArtCourses'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const MyCourses = lazy(() => import('./pages/MyCourses'))
const TeacherCourses = lazy(() => import('./pages/TeacherCourses'))
const CreateCourse = lazy(() => import('./pages/CreateCourse'))
const DashboardOverview = lazy(() => import('./pages/DashboardOverview'))
const DashboardProfile = lazy(() => import('./pages/DashboardProfile'))
const DashboardSubscriptions = lazy(() => import('./pages/DashboardSubscriptions'))
const TeacherSubscribers = lazy(() => import('./pages/TeacherSubscribers'))
const DashboardPlaceholder = lazy(() => import('./pages/DashboardPlaceholder'))
const DashboardQuestionsAnswers = lazy(() => import('./pages/DashboardQuestionsAnswers'))
const DashboardReviews = lazy(() => import('./pages/DashboardReviews'))
const DashboardAnnouncements = lazy(() => import('./pages/DashboardAnnouncements'))
const DashboardAnalytics = lazy(() => import('./pages/DashboardAnalytics'))
const DashboardSettings = lazy(() => import('./pages/DashboardSettings'))
const DashboardWithdraw = lazy(() => import('./pages/DashboardWithdraw'))
const DashboardZoom = lazy(() => import('./pages/DashboardZoom'))
const RejoindreCommunaute = lazy(() => import('./pages/RejoindreCommunaute'))
const TousLesArtistes = lazy(() => import('./pages/TousLesArtistes'))
const ArtistProfile = lazy(() => import('./pages/ArtistProfile'))
const OffreAbonnements = lazy(() => import('./pages/OffreAbonnements'))
const PartagerVotreArt = lazy(() => import('./pages/PartagerVotreArt'))
const FaqContact = lazy(() => import('./pages/FaqContact'))
const AProposPlateforme = lazy(() => import('./pages/AProposPlateforme'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogArticle = lazy(() => import('./pages/BlogArticle'))
const GuidePrixArtistes = lazy(() => import('./pages/GuidePrixArtistes'))
const MesRevenusArtiste = lazy(() => import('./pages/MesRevenusArtiste'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const DashboardCalendar = lazy(() => import('./pages/DashboardCalendar'))

function App() {
  const { user, logout } = useAuth()
  const [mobileMenuState, setMobileMenuState] = useState({ open: false, routeKey: null })
  const location = useLocation()
  const isMobileMenuOpen = mobileMenuState.open && mobileMenuState.routeKey === location.key
  const accountRoute = '/dashboard/profile'

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMobileMenu = () => {
    setMobileMenuState({ open: false, routeKey: location.key })
  }

  const handleLogout = () => {
    logout()
    closeMobileMenu()
  }

  const toggleMobileMenu = () => {
    setMobileMenuState((prev) => {
      const currentlyOpen = prev.open && prev.routeKey === location.key
      return currentlyOpen
        ? { open: false, routeKey: location.key }
        : { open: true, routeKey: location.key }
    })
  }

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link className="nav-logo" to="/" onClick={closeMobileMenu}>
            <img
              src="https://soulintoart.com/wp-content/uploads/2025/08/SIA-logo-turquoise-RVB.png"
              alt="Soul Into Art"
            />
          </Link>

          <nav className="nav-links" aria-label="Navigation principale">
            <div className="nav-item-wrapper">
              <Link to="/partager-votre-art" className="nav-main-link">
                Partager votre art
                <svg className="nav-caret" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
              <div className="nav-dropdown">
                <Link to="/partager-votre-art/cours-en-ligne-guides" className="nav-dropdown-item">
                  Lancer ses premiers cours en ligne : Guides complets
                </Link>
              </div>
            </div>

            <div className="nav-item-wrapper">
              <Link to="/tous-les-cours-en-ligne" className="nav-main-link nav-main-link-simple">
                Tous les cours en ligne
              </Link>
            </div>

            {user?.role !== 'teacher' && (
              <div className="nav-item-wrapper">
                <Link to="/offre-abonnements" className="nav-main-link nav-main-link-simple">
                  Abonnements
                </Link>
              </div>
            )}

            <div className="nav-item-wrapper">
              <Link to="/tous-les-artistes" className="nav-main-link nav-main-link-simple">
                Tous les artistes
              </Link>
            </div>

            <div className="nav-item-wrapper">
              <Link to="/blog" className="nav-main-link nav-main-link-simple">
                Blog
              </Link>
            </div>

            <div className="nav-item-wrapper">
              <Link to="/a-propos-plateforme-sia" className="nav-main-link">
                A propos
                <svg className="nav-caret" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>
              <div className="nav-dropdown">
                <Link to="/faq-contact" className="nav-dropdown-item">
                  Contact & FAQ
                </Link>
              </div>
            </div>
          </nav>

          <div className="nav-auth">
            {user ? (
              <div className="nav-icon-group">
                {user.role !== 'teacher' && (
                  <Link to="/offre-abonnements" className="nav-icon-btn nav-cart-btn" aria-label="Panier">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                      <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </Link>
                )}
                <Link to={accountRoute} className="nav-icon-btn nav-user-btn" aria-label="Mon compte">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/dashboard" className="nav-link-auth">Connexion</Link>
                <Link to="/rejoindre-communaute-sia" className="nav-btn-signup">Inscription</Link>
              </div>
            )}
          </div>

          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMobileMenu} />
        )}

        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-content">
            <nav className="mobile-nav-links">
              <div className="mobile-nav-item">
                <Link to="/partager-votre-art" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Partager votre art
                </Link>
                <Link
                  to="/partager-votre-art/cours-en-ligne-guides"
                  className="mobile-submenu-link"
                  onClick={closeMobileMenu}
                >
                  Lancer ses premiers cours en ligne
                </Link>
              </div>

              <div className="mobile-nav-item">
                <Link to="/tous-les-cours-en-ligne" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Tous les cours en ligne
                </Link>
              </div>

              {user?.role !== 'teacher' && (
                <div className="mobile-nav-item">
                  <Link to="/offre-abonnements" className="mobile-nav-link" onClick={closeMobileMenu}>
                    Abonnements
                  </Link>
                </div>
              )}

              <div className="mobile-nav-item">
                <Link to="/tous-les-artistes" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Tous les artistes
                </Link>
              </div>

              <div className="mobile-nav-item">
                <Link to="/blog" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Blog
                </Link>
              </div>

              <div className="mobile-nav-item">
                <Link to="/a-propos-plateforme-sia" className="mobile-nav-link" onClick={closeMobileMenu}>
                  A propos
                </Link>
                <Link to="/faq-contact" className="mobile-submenu-link" onClick={closeMobileMenu}>
                  Contact & FAQ
                </Link>
              </div>
            </nav>

            <div className="mobile-auth-section">
              {user ? (
                <>
                  <div className="mobile-auth-logged-in">
                    {user.role !== 'teacher' && (
                      <Link to="/offre-abonnements" className="mobile-icon-btn" onClick={closeMobileMenu}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                          <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </Link>
                    )}
                    <Link to={accountRoute} className="mobile-icon-btn mobile-user-icon-btn" onClick={closeMobileMenu}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </Link>
                  </div>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Se deconnecter
                  </button>
                </>
              ) : (
                <div className="mobile-auth-logged-out">
                  <Link to="/dashboard" className="mobile-auth-link" onClick={closeMobileMenu}>Connexion</Link>
                  <Link to="/rejoindre-communaute-sia" className="mobile-auth-signup" onClick={closeMobileMenu}>Inscription</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        <Suspense fallback={<div className="page-loading">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth and onboarding */}
          <Route path="/dashboard" element={<Login />} />
          <Route path="/rejoindre-communaute-sia" element={<RejoindreCommunaute />} />
          <Route path="/student-registration" element={<Signup initialRole="student" />} />
          <Route path="/instructor-registration" element={<Signup initialRole="teacher" />} />

          {/* Public content */}
           <Route path="/tous-les-cours-en-ligne" element={<ArtCourses />} />
           <Route path="/tous-les-cours/:discipline/:slug" element={<CourseDetail />} />
           <Route path="/tous-les-artistes" element={<TousLesArtistes />} />
           <Route path="/tous-les-artistes/:slug" element={<ArtistProfile />} />
           <Route path="/offre-abonnements" element={<OffreAbonnements />} />
           <Route path="/partager-votre-art" element={<PartagerVotreArt />} />
           <Route path="/faq-contact" element={<FaqContact />} />
           <Route path="/a-propos-plateforme-sia" element={<AProposPlateforme />} />
           <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:category/:slug" element={<BlogArticle />} />
          <Route path="/guide-prix-artistes" element={<GuidePrixArtistes />} />
          <Route path="/mes-revenus-artiste" element={<MesRevenusArtiste />} />

          {/* Legal */}
          <Route
            path="/cgv-cgu"
            element={<LegalPage contentKey="legal.cgv_cgu" fallbackTitle="CGV / CGU" />}
          />
          <Route
            path="/politique-de-cookies"
            element={<LegalPage contentKey="legal.cookies" fallbackTitle="Politique de cookies" />}
          />
          <Route
            path="/politique-de-donnees-et-de-confidentialite"
            element={<LegalPage contentKey="legal.privacy" fallbackTitle="Politique de donnees et de confidentialite" />}
          />
          <Route
            path="/mentions-legales"
            element={<LegalPage contentKey="legal.legal_notice" fallbackTitle="Mentions legales" />}
          />

          {/* Dashboard routes */}
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/dashboard/overview" element={<DashboardOverview />} />
          <Route path="/dashboard/profile" element={<DashboardProfile />} />
          <Route path="/dashboard/subscriptions" element={<DashboardSubscriptions />} />
          <Route path="/dashboard/my-courses" element={<MyCourses />} />
          <Route path="/dashboard/reviews" element={<DashboardReviews />} />
          <Route path="/dashboard/quiz-attempts" element={<DashboardPlaceholder title="Mes tentatives de quiz" description="Retrouvez l'historique de vos quiz et vos scores." />} />
          <Route path="/dashboard/wishlist" element={<DashboardPlaceholder title="Liste de souhaits" description="Vos cours preferes sauvegardes pour plus tard." ctaTo="/tous-les-cours-en-ligne" ctaLabel="Ajouter un cours" />} />
          <Route path="/dashboard/orders" element={<DashboardPlaceholder title="Historique de commande" description="Le detail de vos achats et factures sera affiche ici." />} />
          <Route path="/dashboard/questions-answers" element={<DashboardQuestionsAnswers />} />
          <Route path="/dashboard/calendar" element={<DashboardCalendar />} />

          <Route path="/dashboard/teacher" element={<TeacherCourses />} />
          <Route path="/dashboard/teacher/courses" element={<TeacherCourses />} />
          <Route path="/dashboard/teacher/courses/new" element={<CreateCourse />} />
          <Route path="/dashboard/teacher/subscribers" element={<TeacherSubscribers />} />
          <Route path="/dashboard/announcements" element={<DashboardAnnouncements />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          <Route path="/dashboard/settings" element={<DashboardSettings />} />
          <Route path="/dashboard/settings/billing" element={<DashboardSettings />} />
          <Route path="/dashboard/settings/reset-password" element={<DashboardSettings />} />
          <Route path="/dashboard/settings/social-profile" element={<DashboardSettings />} />
          <Route path="/dashboard/settings/withdraw-settings" element={<DashboardSettings />} />
          <Route path="/dashboard/withdraw" element={<DashboardWithdraw />} />
          <Route path="/dashboard/zoom" element={<DashboardZoom />} />

          {/* Compatibility redirects */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={<Navigate to="/rejoindre-communaute-sia" replace />} />
          <Route path="/courses" element={<Navigate to="/tous-les-cours-en-ligne" replace />} />
          <Route path="/abonnements" element={<Navigate to="/offre-abonnements" replace />} />
          <Route path="/cart" element={<Navigate to="/offre-abonnements" replace />} />
          <Route path="/partager-votre-art/cours-en-ligne-guides" element={<Navigate to="/guide-prix-artistes" replace />} />
          <Route path="/dashboard/create-course" element={<Navigate to="/dashboard/teacher/courses/new" replace />} />
          <Route path="/my-courses" element={<Navigate to="/dashboard/my-courses" replace />} />
        </Routes>
        </Suspense>
      </main>
    </>
  )
}

export default App

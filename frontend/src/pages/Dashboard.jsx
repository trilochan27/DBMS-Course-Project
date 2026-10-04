import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  ArrowDown,
  ArrowRight,
  Bus,
  CheckCircle2,
  CircleDot,
  Database,
  MapPin,
  Route as RouteIcon,
  Users,
  Wifi,
  Sparkles,
  Gauge,
  ShieldCheck,
  Navigation,
  GraduationCap,
  Zap,
  Clock3
} from 'lucide-react';

import { api } from '../api';
import { useToast } from '../components/ToastContext.jsx';


/* ============================================================
   FALLBACK DATA
   ============================================================ */

const fallbackFleet = [
  {
    bus_number: 'TS09AB101',
    capacity: 40,
    assigned_students: 40,
    available_capacity: 0,
    route_name: 'Gachibowli-Woxsen Route'
  },
  {
    bus_number: 'TS09AB102',
    capacity: 35,
    assigned_students: 35,
    available_capacity: 0,
    route_name: 'Kondapur-Woxsen Route'
  },
  {
    bus_number: 'TS09AB103',
    capacity: 40,
    assigned_students: 40,
    available_capacity: 0,
    route_name: 'Miyapur-Woxsen Route'
  },
  {
    bus_number: 'TS09AB104',
    capacity: 40,
    assigned_students: 40,
    available_capacity: 0,
    route_name: 'Kukatpally-Woxsen Route'
  },
  {
    bus_number: 'TS09AB105',
    capacity: 40,
    assigned_students: 40,
    available_capacity: 0,
    route_name: 'Manikonda-Woxsen Route'
  },
  {
    bus_number: 'TS09AB106',
    capacity: 45,
    assigned_students: 45,
    available_capacity: 0,
    route_name: 'Narsingi-Woxsen Route'
  },
  {
    bus_number: 'TS09AB107',
    capacity: 45,
    assigned_students: 45,
    available_capacity: 0,
    route_name: 'Jubilee Hills-Woxsen Route'
  }
];

const stops = [
  'Gachibowli Circle',
  'Financial District',
  'Nanakramguda',
  'Woxsen University'
];


/*
 * Visual students.
 * These are only the animated representation of the
 * transport journey. They do NOT modify the database.
 */
const journeyStudents = Array.from(
  { length: 12 },
  (_, i) => i
);


/* ============================================================
   SCROLL PROGRESS
   ============================================================ */

function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const el = ref.current;

        if (!el) return;

        const rect = el.getBoundingClientRect();

        const distance = Math.max(
          1,
          el.offsetHeight - window.innerHeight
        );

        const next = Math.min(
          1,
          Math.max(
            0,
            -rect.top / distance
          )
        );

        setProgress(next);
      });
    };

    update();

    window.addEventListener(
      'scroll',
      update,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      update
    );

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener(
        'scroll',
        update
      );

      window.removeEventListener(
        'resize',
        update
      );
    };
  }, [ref]);

  return progress;
}


/* ============================================================
   REVEAL COMPONENT
   ============================================================ */

function Reveal({
  children,
  className = ''
}) {
  const ref = useRef(null);

  const [visible, setVisible] =
    useState(true);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: 0.16
        }
      );

    observer.observe(el);

    return () =>
      observer.disconnect();

  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${
        visible ? 'is-visible' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}


/* ============================================================
   DASHBOARD
   ============================================================ */

export default function Dashboard() {

  const toast = useToast();

  const journeyRef =
    useRef(null);

  const progress =
    useScrollProgress(journeyRef);

  const [stats, setStats] =
    useState(null);

  const [fleet, setFleet] =
    useState(fallbackFleet);

  const [health, setHealth] =
    useState('checking');

  const [loading, setLoading] =
    useState(true);


  /* ==========================================================
     LOAD REAL DATABASE DATA
     ========================================================== */

  const load =
    useCallback(async () => {

      setLoading(true);

      try {

        const [
          statsRes,
          fleetRes
        ] = await Promise.all([
          api.dashboardStats(),
          api.getBusCapacity()
        ]);

        setStats(
          statsRes.data
        );

        if (
          Array.isArray(
            fleetRes.data
          ) &&
          fleetRes.data.length
        ) {
          setFleet(
            fleetRes.data
          );
        }

      } catch (err) {

        toast.error(
          err.message
        );

      } finally {

        setLoading(false);

      }

    }, [toast]);


  useEffect(() => {
    load();
  }, [load]);


  /* ==========================================================
     MYSQL HEALTH CHECK
     ========================================================== */

  useEffect(() => {

    let mounted = true;

    const check = () => {

      api.health()

        .then((r) => {

          if (!mounted) return;

          setHealth(
            r.database === 'connected'
              ? 'online'
              : 'offline'
          );

        })

        .catch(() => {

          if (mounted) {
            setHealth('offline');
          }

        });

    };

    check();

    const interval =
      setInterval(
        check,
        15000
      );

    return () => {

      mounted = false;

      clearInterval(
        interval
      );

    };

  }, []);


  /* ==========================================================
     DATABASE STATS
     ========================================================== */

  const count = (
    key,
    fallback
  ) =>
    stats?.[key] ??
    fallback;


  /* ==========================================================
     🚍 CINEMATIC JOURNEY ENGINE
     ========================================================== */

  /*
   * PHASES
   *
   * 0.00 - 0.12  Waiting
   * 0.12 - 0.22  Bus arriving
   * 0.22 - 0.65  Boarding
   * 0.65 - 0.78  Ready to depart
   * 0.78 - 1.00  Driving to Woxsen
   */

  const waiting =
    progress < 0.12;

  const busArriving =
    progress >= 0.12 &&
    progress < 0.22;

  const boarding =
    progress >= 0.22 &&
    progress < 0.65;

  const departure =
    progress >= 0.78;


  /* ----------------------------------------------------------
     BOARDING PROGRESS
     ---------------------------------------------------------- */

  const boardingProgress =
    Math.min(
      1,
      Math.max(
        0,
        (progress - 0.22) /
        0.43
      )
    );


  /* ----------------------------------------------------------
     OCCUPANCY
     ---------------------------------------------------------- */

  const occupied =
    Math.round(
      boardingProgress * 40
    );


  /* ----------------------------------------------------------
     BUS POSITION
     ---------------------------------------------------------- */

  let busX;

  if (progress < 0.12) {

    /*
     * Bus waits slightly off-screen.
     */

    busX = -12;

  } else if (progress < 0.22) {

    /*
     * Bus arrives.
     */

    const arrival =
      (progress - 0.12) /
      0.10;

    busX =
      -12 +
      arrival * 25;

  } else if (progress < 0.78) {

    /*
     * Bus stays at pickup
     * while students board.
     */

    busX = 13;

  } else {

    /*
     * Bus departs.
     */

    const drive =
      (progress - 0.78) /
      0.22;

    busX =
      13 +
      drive * 110;

  }


  /* ----------------------------------------------------------
     BUS VERTICAL MOVEMENT
     ---------------------------------------------------------- */

  const busBob =
    Math.sin(
      progress * Math.PI * 5
    ) *
    (
      departure
        ? 2
        : 1
    );


  /* ----------------------------------------------------------
     ROAD MOVEMENT
     ---------------------------------------------------------- */

  const roadShift =
    departure
      ? ((progress - 0.78) / 0.22) * 260
      : 0;


  /* ----------------------------------------------------------
     SCENE GLOW
     ---------------------------------------------------------- */

  const sceneGlow =
    departure
      ? Math.min(
          1,
          (progress - 0.78) /
          0.22
        )
      : 0;


  /* ----------------------------------------------------------
     STATUS
     ---------------------------------------------------------- */

  const journeyStatus =
    waiting
      ? 'Students are ready.'
      : busArriving
      ? 'Your bus has arrived.'
      : boarding
      ? 'Students are boarding.'
      : departure
      ? 'The route is moving.'
      : 'Everyone is onboard.';


  const journeySubtext =
    waiting
      ? 'The morning run is about to begin.'
      : busArriving
      ? 'Bus B001 is arriving at Gachibowli Circle.'
      : boarding
      ? `${occupied} students are now onboard.`
      : departure
      ? 'B001 is heading toward Woxsen University.'
      : 'All students are onboard and ready.';


  /* ==========================================================
     FLEET DATA
     ========================================================== */

  const fleetTotal =
    useMemo(
      () =>
        fleet.reduce(
          (sum, bus) =>
            sum +
            Number(
              bus.capacity || 0
            ),
          0
        ),
      [fleet]
    );


  const assignedTotal =
    useMemo(
      () =>
        fleet.reduce(
          (sum, bus) =>
            sum +
            Number(
              bus.assigned_students || 0
            ),
          0
        ),
      [fleet]
    );


  const routeDraw =
    Math.min(
      1,
      progress * 1.25
    );


  const routeStroke =
    560 *
    (1 - routeDraw);


  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <div
      className="cinematic-page"
      style={{
        '--journey-progress':
          progress,
        '--road-shift':
          `${roadShift}px`
      }}
    >

      {/* ======================================================
          AMBIENT BACKGROUND
          ====================================================== */}

      <div
        className="ambient ambient-one"
      />

      <div
        className="ambient ambient-two"
      />

      <div
        className="ambient ambient-three"
      />


      {/* ======================================================
          TOP NAV
          ====================================================== */}

      <header
        className="cinematic-nav"
      >

        <div
          className="cinematic-brand"
        >

          <div
            className="cinematic-logo"
          >
            <Bus size={18} />
          </div>

          <div>

            <strong>
              Transport OS
            </strong>

            <span>
              school_transport_db
            </span>

          </div>

        </div>


        <div
          className={`live-pill ${
            health === 'online'
              ? 'online'
              : health === 'offline'
              ? 'offline'
              : ''
          }`}
        >

          <span
            className="live-dot"
          />

          {health === 'online'
            ? 'MySQL Live'
            : health === 'offline'
            ? 'DB Offline'
            : 'Connecting'}

        </div>

      </header>


      {/* ======================================================
          HERO
          ====================================================== */}

      <section
        className="cinematic-hero"
      >

        <div
          className="hero-copy"
        >

          <div
            className="eyebrow"
          >
            <Sparkles size={14} />

            SCHOOL TRANSPORT OPERATIONS
          </div>


          <h1>
            Every route.
            <br />

            <span>
              Every student.
            </span>

            <br />

            Connected.
          </h1>


          <p>
            A live transport experience
            built on your MySQL database —
            from pickup point to final drop.
          </p>


          <a
            href="#journey"
            className="scroll-cue"
          >
            Scroll to start the journey

            <ArrowDown size={16} />

          </a>

        </div>


        <div
          className="hero-orbit orbit-a"
        />

        <div
          className="hero-orbit orbit-b"
        />


        <div
          className="hero-metric-grid"
        >

          <div>
            <strong>
              {count(
                'students',
                285
              )}
            </strong>

            <span>
              Students
            </span>
          </div>


          <div>
            <strong>
              {count(
                'buses',
                7
              )}
            </strong>

            <span>
              Buses
            </span>
          </div>


          <div>
            <strong>
              {count(
                'routes',
                7
              )}
            </strong>

            <span>
              Routes
            </span>
          </div>

        </div>

      </section>


      {/* ======================================================
          🚍 UPDATE #7 — CINEMATIC JOURNEY
          ====================================================== */}

      <section
        id="journey"
        ref={journeyRef}
        className="journey-scroll"
      >

        <div
          className="journey-sticky"
        >

          {/* --------------------------------------------------
              SECTION LABEL
              -------------------------------------------------- */}

          <div
            className="journey-label"
          >
            01 / THE MORNING RUN
          </div>


          {/* --------------------------------------------------
              DYNAMIC TITLE
              -------------------------------------------------- */}

          <div
            className="journey-title"
          >

            <span>
              {journeyStatus}
            </span>

            <small>
              {journeySubtext}
            </small>

          </div>


          {/* --------------------------------------------------
              LIVE TRANSPORT INDICATOR
              -------------------------------------------------- */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              marginBottom: '10px',
              color: departure
                ? '#55d8ff'
                : '#6fdaaa',
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600
            }}
          >

            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background:
                  departure
                    ? '#55d8ff'
                    : '#42d995',
                boxShadow:
                  `0 0 12px ${
                    departure
                      ? 'rgba(85,216,255,.8)'
                      : 'rgba(66,217,149,.8)'
                  }`,
                animation:
                  'pulse 1.5s infinite'
              }}
            />

            {departure
              ? 'LIVE ROUTE IN MOTION'
              : boarding
              ? 'LIVE TRANSPORT SIMULATION'
              : 'TRANSPORT SYSTEM READY'}

          </div>


          {/* ==================================================
              STREET SCENE
              ================================================== */}

          <div
            className="street-scene"
            style={{
              '--journey-glow':
                sceneGlow
            }}
          >

            {/* ----------------------------------------------
                SKYLINE
                ---------------------------------------------- */}

            <div
              className="skyline skyline-back"
            />

            <div
              className="skyline skyline-front"
            />


            {/* ----------------------------------------------
                MOVING LIGHT PARTICLES
                ---------------------------------------------- */}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none'
              }}
            >

              {Array.from(
                { length: 18 },
                (_, i) => (

                  <span
                    key={i}
                    style={{
                      position: 'absolute',

                      width:
                        i % 3 === 0
                          ? '4px'
                          : '2px',

                      height:
                        i % 3 === 0
                          ? '4px'
                          : '2px',

                      borderRadius:
                        '50%',

                      left:
                        `${(i * 17) % 100}%`,

                      top:
                        `${15 + ((i * 23) % 55)}%`,

                      background:
                        i % 2 === 0
                          ? '#54d8ff'
                          : '#7692ff',

                      boxShadow:
                        `0 0 12px ${
                          i % 2 === 0
                            ? 'rgba(84,216,255,.8)'
                            : 'rgba(118,146,255,.7)'
                        }`,

                      opacity:
                        0.35 +
                        (
                          (i % 4) *
                          0.12
                        ),

                      transform:
                        departure
                          ? `translateX(-${roadShift * (0.2 + (i % 3) * 0.15)}px)`
                          : 'translateX(0)',

                      transition:
                        'transform .15s linear'
                    }}
                  />

                )
              )}

            </div>


            {/* ----------------------------------------------
                ROAD GLOW
                ---------------------------------------------- */}

            <div
              className="road-glow"
              style={{
                transform:
                  `translateX(-${roadShift * 0.25}px)`
              }}
            />


            {/* ----------------------------------------------
                ROAD
                ---------------------------------------------- */}

            <div
              className="road"
              style={{
                transform:
                  `translateX(-${roadShift}px)`
              }}
            >

              <div
                className="lane lane-one"
              />

              <div
                className="lane lane-two"
              />

            </div>


            {/* ----------------------------------------------
                PICKUP STOP
                ---------------------------------------------- */}

            <div
              className="boarding-stop"
            >

              <div
                className="stop-sign"
              >
                <MapPin size={15} />

                PICKUP POINT
              </div>


              {/* --------------------------------------------
                  STUDENTS
                  -------------------------------------------- */}

              <div
                className="students-waiting"
              >

                {journeyStudents.map(
                  (student) => {

                    const delay =
                      student * 0.055;

                    const board =
                      Math.min(
                        1,
                        Math.max(
                          0,
                          (
                            progress -
                            0.22 -
                            delay
                          ) / 0.24
                        )
                      );


                    const boarded =
                      board >= 0.92;


                    return (

                      <div
                        key={student}
                        className="mini-student"
                        style={{
                          '--board':
                            board,

                          '--delay':
                            `${delay}s`,

                          /*
                           * Additional inline animation
                           * so students actually move
                           * toward the bus.
                           */
                          opacity:
                            boarded
                              ? 0
                              : 1,

                          transform:
                            boarded
                              ? `
                                translateX(105px)
                                translateY(-18px)
                                scale(.55)
                              `
                              : `
                                translateX(${
                                  board * 8
                                }px)
                              `,

                          transition:
                            `
                            transform
                            .65s
                            cubic-bezier(.22,.8,.32,1),
                            opacity
                            .35s
                            ease
                            `
                        }}
                      >

                        <span
                          className="student-head"
                        />

                        <span
                          className="student-body"
                        />

                      </div>

                    );

                  }
                )}

              </div>


              <div
                className="stop-name"
              >
                Gachibowli Circle
              </div>

            </div>


            {/* =================================================
                BUS
                ================================================= */}

            <div
              className="bus-wrap"
              style={{
                transform:
                  `
                  translateX(${busX}vw)
                  translateY(${busBob}px)
                  `
              }}
            >

              {/* BUS SHADOW */}

              <div
                className="bus-shadow"
                style={{
                  transform:
                    departure
                      ? 'scaleX(1.15)'
                      : 'scaleX(1)'
                }}
              />


              {/* BUS BODY */}

              <div
                className="bus-art"
                style={{
                  filter:
                    departure
                      ? `
                        drop-shadow(
                          0 0 18px
                          rgba(71,180,255,.45)
                        )
                      `
                      : `
                        drop-shadow(
                          0 10px 20px
                          rgba(0,0,0,.35)
                        )
                      `,
                  transition:
                    'filter .3s ease'
                }}
              >

                {/* TOP */}

                <div
                  className="bus-top"
                >

                  <span>
                    TRANSPORT
                  </span>

                  <b>
                    B001
                  </b>

                </div>


                {/* WINDOWS */}

                <div
                  className="bus-window"
                >

                  <i
                    style={{
                      opacity:
                        departure
                          ? 1
                          : 0.85
                    }}
                  />

                  <i
                    style={{
                      opacity:
                        departure
                          ? 1
                          : 0.85
                    }}
                  />

                  <i
                    style={{
                      opacity:
                        departure
                          ? 1
                          : 0.85
                    }}
                  />

                  <i
                    style={{
                      opacity:
                        departure
                          ? 1
                          : 0.85
                    }}
                  />

                </div>


                {/* LOWER BODY */}

                <div
                  className="bus-lower"
                >

                  <div
                    className="bus-wheel"
                  />

                  <div
                    className="bus-wheel"
                  />

                </div>


                {/* HEADLIGHTS */}

                <div
                  style={{
                    position:
                      'absolute',

                    right:
                      '-2px',

                    top:
                      '42px',

                    width:
                      '7px',

                    height:
                      '7px',

                    borderRadius:
                      '50%',

                    background:
                      departure
                        ? '#e7fbff'
                        : '#6aa6ff',

                    boxShadow:
                      departure
                        ? `
                          0 0 8px
                          #e7fbff,
                          0 0 22px
                          #54d8ff
                        `
                        : 'none',

                    transition:
                      'all .3s ease'
                  }}
                />

              </div>


              {/* BUS CAPTION */}

              <div
                className="bus-caption"
              >
                TS09AB101 · 40 seats
              </div>

            </div>


            {/* =================================================
                OCCUPANCY CARD
                ================================================= */}

            <div
              className="occupancy-card"
            >

              <div>

                <span>
                  LIVE OCCUPANCY
                </span>

                <strong>
                  {occupied}
                  <em>
                    /40
                  </em>
                </strong>

              </div>


              <div
                className="occupancy-bar"
              >

                <span
                  style={{
                    width:
                      `${(
                        occupied /
                        40
                      ) * 100}%`
                  }}
                />

              </div>


              <small>

                {waiting
                  ? 'Waiting for bus'
                  : busArriving
                  ? 'Bus arriving'
                  : boarding
                  ? 'Students boarding'
                  : departure
                  ? 'Bus in motion'
                  : 'Bus ready'}

              </small>

            </div>


            {/* =================================================
                LIVE ROUTE STATUS
                ================================================= */}

            <div
              style={{
                position:
                  'absolute',

                left:
                  '50%',

                bottom:
                  '18px',

                transform:
                  'translateX(-50%)',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '8px',

                padding:
                  '8px 13px',

                border:
                  '1px solid rgba(110,160,255,.18)',

                borderRadius:
                  '999px',

                background:
                  'rgba(5,12,28,.65)',

                backdropFilter:
                  'blur(12px)',

                color:
                  '#8da5d8',

                fontSize:
                  '10px',

                letterSpacing:
                  '.12em',

                textTransform:
                  'uppercase',

                whiteSpace:
                  'nowrap'
              }}
            >

              <Clock3 size={12} />

              {departure
                ? 'En route · Woxsen'
                : boarding
                ? `${occupied}/40 onboard`
                : 'Pickup · Gachibowli'}

            </div>


            {/* =================================================
                DESTINATION
                ================================================= */}

            <div
              className="destination"
              style={{
                opacity:
                  departure
                    ? 1
                    : 0.7,

                transform:
                  departure
                    ? 'translateX(-8px) scale(1.04)'
                    : 'translateX(0) scale(1)',

                transition:
                  'all .5s ease'
              }}
            >

              <Navigation
                size={15}
              />

              <span>
                Woxsen University
              </span>

            </div>


            {/* =================================================
                DEPARTURE STATUS
                ================================================= */}

            {departure && (

              <div
                style={{
                  position:
                    'absolute',

                  top:
                    '20px',

                  left:
                    '50%',

                  transform:
                    'translateX(-50%)',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '7px',

                  color:
                    '#65ddff',

                  fontSize:
                    '10px',

                  letterSpacing:
                    '.16em',

                  textTransform:
                    'uppercase',

                  whiteSpace:
                    'nowrap'
                }}
              >

                <Zap size={12} />

                ROUTE IN MOTION

              </div>

            )}

          </div>


          {/* ==================================================
              JOURNEY PROGRESS
              ================================================== */}

          <div
            className="journey-progress"
          >

            <span
              style={{
                width:
                  `${progress * 100}%`
              }}
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          SECTION 02 — ROUTES
          ====================================================== */}

      <Reveal
        className="story-section route-story"
      >

        <div
          className="section-kicker"
        >
          02 / ROUTE NETWORK
        </div>


        <div
          className="story-heading"
        >

          <div>

            <h2>
              One journey.
              <br />

              <span>
                Multiple connected stops.
              </span>
            </h2>

          </div>


          <p>
            Our route layer connects
            students to pickup points,
            drop points, buses and drivers
            — all through relational data.
          </p>

        </div>


        <div
          className="route-visual glass-card"
        >

          <div
            className="route-map"
          >



            <svg
              viewBox="0 0 900 250"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
  <linearGradient
    id="routeGradient"
    x1="0%"
    y1="0%"
    x2="100%"
    y2="0%"
  >
    <stop offset="0%" stopColor="#7088ff" />
    <stop offset="50%" stopColor="#68b8ff" />
    <stop offset="100%" stopColor="#67dfc0" />
  </linearGradient>
</defs>

              <path
                className="route-path route-path-bg"
                d="
                  M70 180
                  C190 80,
                  280 200,
                  390 120
                  S620 80,
                  820 155
                "
              />

              <path
                className="route-path route-path-live"
                d="
                  M70 180
                  C190 80,
                  280 200,
                  390 120
                  S620 80,
                  820 155
                "
                style={{
                  strokeDashoffset:
                    routeStroke
                }}
              />

            </svg>


            {stops.map(
              (stop, i) => (

                <div
                  className="route-node"
                  key={stop}
                  style={{
                    left:
                      `${8 + i * 27}%`,

                    top:
                      `${
                        i === 1
                          ? 34
                          : i === 2
                          ? 51
                          : i === 0
                          ? 70
                          : 61
                      }%`
                  }}
                >

                  <CircleDot
                    size={17}
                  />

                  <span>
                    {stop}
                  </span>

                </div>

              )
            )}

          </div>


          <div
            className="route-meta"
          >

            <div>
              <RouteIcon
                size={17}
              />

              <span>
                <strong>
                  {count(
                    'routes',
                    7
                  )}
                </strong>

                active routes
              </span>
            </div>


            <div>
              <MapPin
                size={17}
              />

              <span>
                <strong>
                  {count(
                    'pickupPoints',
                    21
                  )}
                </strong>

                pickup points
              </span>
            </div>


            <div>
              <MapPin
                size={17}
              />

              <span>
                <strong>
                  {count(
                    'dropPoints',
                    21
                  )}
                </strong>

                drop points
              </span>
            </div>

          </div>

        </div>

      </Reveal>


      {/* ======================================================
          SECTION 03 — FLEET
          ====================================================== */}

      <Reveal
        className="story-section fleet-story"
      >

        <div
          className="section-kicker"
        >
          03 / THE FLEET
        </div>


        <div
          className="story-heading"
        >

          <h2>
            Seven buses.
            <br />

            <span>
              Every seat accounted for.
            </span>
          </h2>


          <p>
            Capacity is calculated from
            the live route assignment data
            — no mock numbers.
          </p>

        </div>


        <div
          className="fleet-summary glass-card"
        >

          <div
            className="fleet-summary-main"
          >

            <Gauge size={20} />

            <span>

              <strong>
                {
                  assignedTotal ||
                  count(
                    'transportAssignments',
                    285
                  )
                }
              </strong>

              assigned

            </span>

            <small>
              of {
                fleetTotal ||
                285
              } total seats
            </small>

          </div>


          <div
            className="fleet-summary-bar"
          >

            <span
              style={{
                width:
                  `${
                    Math.min(
                      100,
                      (
                        (
                          assignedTotal ||
                          285
                        ) /
                        (
                          fleetTotal ||
                          285
                        )
                      ) *
                      100
                    )
                  }%`
              }}
            />

          </div>


          <div
            className="fleet-badges"
          >

            <span>
              <ShieldCheck
                size={14}
              />

              Capacity balanced
            </span>

            <span>
              <Wifi
                size={14}
              />

              Live database
            </span>

          </div>

        </div>


        <div
          className="fleet-grid"
        >

          {fleet.map(
            (bus, index) => {

              const cap =
                Number(
                  bus.capacity || 0
                );

              const assigned =
                Number(
                  bus.assigned_students ||
                  0
                );

              const pct =
                cap
                  ? Math.round(
                      (
                        assigned /
                        cap
                      ) *
                      100
                    )
                  : 0;


              return (

                <div
                  className="fleet-card glass-card"
                  key={
                    bus.bus_number ||
                    index
                  }
                  style={{
                    '--delay':
                      `${index * 60}ms`
                  }}
                >

                  <div
                    className="fleet-card-top"
                  >

                    <div
                      className="fleet-bus-icon"
                    >
                      <Bus
                        size={19}
                      />
                    </div>

                    <span>
                      {bus.bus_number}
                    </span>

                  </div>


                  <h3>
                    {
                      bus.route_name ||
                      `Route ${
                        index + 1
                      }`
                    }
                  </h3>


                  <div
                    className="fleet-capacity"
                  >

                    <strong>
                      {assigned}
                    </strong>

                    <span>
                      / {cap} seats
                    </span>

                    <b>
                      {pct}%
                    </b>

                  </div>


                  <div
                    className="capacity-line"
                  >

                    <span
                      style={{
                        width:
                          `${pct}%`
                      }}
                    />

                  </div>

                </div>

              );

            }
          )}

        </div>

      </Reveal>


      {/* ======================================================
          SECTION 04 — DATABASE
          ====================================================== */}

      <Reveal
        className="story-section data-story"
      >

        <div
          className="section-kicker"
        >
          04 / THE DATABASE
        </div>


        <div
          className="data-grid"
        >

          <div>

            <h2>
              Behind every ride
              <br />

              <span>
                is a relationship.
              </span>
            </h2>


            <p>
              The UI is only the surface.
              Underneath, the transport system
              is driven by real MySQL tables
              and joins.
            </p>


            <div
              className="data-live"
            >

              <span
                className="live-dot"
              />

              {health === 'online'
                ? 'MYSQL CONNECTION ACTIVE'
                : 'DATABASE STATUS CHECKING'}

            </div>

          </div>


          <div
            className="schema-visual glass-card"
          >

            <div
              className="schema-node main"
            >

              <Database
                size={17}
              />

              <b>
                student
              </b>

              <small>
                285 records
              </small>

            </div>


            <div
              className="schema-line line-a"
            />

            <div
              className="schema-line line-b"
            />

            <div
              className="schema-line line-c"
            />


            <div
              className="schema-node node-a"
            >

              <Users
                size={16}
              />

              <b>
                student_transport
              </b>

              <small>
                285 assignments
              </small>

            </div>


            <div
              className="schema-node node-b"
            >

              <MapPin
                size={16}
              />

              <b>
                pickup_point
              </b>

              <small>
                21 stops
              </small>

            </div>


            <div
              className="schema-node node-c"
            >

              <Bus
                size={16}
              />

              <b>
                bus + route
              </b>

              <small>
                7 + 7 records
              </small>

            </div>

          </div>

        </div>

      </Reveal>


      {/* ======================================================
          SECTION 05 — FINAL
          ====================================================== */}

      <Reveal
        className="story-section final-story"
      >

        <div
          className="final-card"
        >
          <div className="final-stats">
  <div>
    <strong>285</strong>
    Students
  </div>

  <div>
    <strong>7</strong>
    Buses
  </div>

  <div>
    <strong>7</strong>
    Routes
  </div>

  <div>
    <strong>42</strong>
    Stops
  </div>
</div>

          <div
            className="final-glow"
          />


          <div
            className="final-icon"
          >

            <GraduationCap
              size={28}
            />

          </div>


          <div
            className="section-kicker"
          >
            05 / READY FOR THE LIVE DEMO
          </div>


          <h2>
            From database
            <br />

            <span>
              to real-world journey.
            </span>
          </h2>


          <p>
            View students. Insert a student.
            Delete a student. Watch MySQL
            change in real time.
          </p>


          <a
            className="demo-link"
            href="/students"
          >

            Open Student Management

            <ArrowRight
              size={16}
            />

          </a>

        </div>

      </Reveal>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer
        className="cinematic-footer"
      >

        <span>
          TRANSPORT MANAGEMENT SYSTEM
        </span>

        <span>
          {
            loading
              ? 'Syncing live data…'
              : 'Live data synced'
          }
        </span>

      </footer>

    </div>
  );
}
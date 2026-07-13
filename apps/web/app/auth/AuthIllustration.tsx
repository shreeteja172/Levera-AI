"use client";

import { useState, useEffect } from "react";
import styles from "./auth.module.css";

export default function AuthIllustration() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeNode, setActiveNode] = useState<number>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => {
        const seq = [1, 2, 4, 5, 3];
        const nextIdx = (seq.indexOf(prev) + 1) % seq.length;
        return seq[nextIdx] ?? 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const initialArray = [35, 75, 50, 90, 20, 60, 45, 80];
  const [array, setArray] = useState(initialArray);
  const [sortingIndices, setSortingIndices] = useState<[number, number]>([-1, -1]);
  const [isSorted, setIsSorted] = useState(false);
  const [sortedCount, setSortedCount] = useState(-1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let arr = [...initialArray];
    let i = 0;
    let j = 0;
    let sorted = false;

    const sortStep = () => {
      if (sorted) {
        arr = [...initialArray];
        setArray(arr);
        setSortingIndices([-1, -1]);
        setIsSorted(false);
        setSortedCount(-1);
        sorted = false;
        i = 0;
        j = 0;
        timer = setTimeout(sortStep, 1500);
        return;
      }

      if (i < arr.length - 1) {
        if (j < arr.length - i - 1) {
          setSortingIndices([j, j + 1]);
          const valJ = arr[j];
          const valJPlus = arr[j + 1];
          if (valJ !== undefined && valJPlus !== undefined) {
            if (valJ > valJPlus) {
              arr[j] = valJPlus;
              arr[j + 1] = valJ;
              setArray([...arr]);
            }
          }
          j++;
          timer = setTimeout(sortStep, 350);
        } else {
          setSortedCount(arr.length - i - 1);
          j = 0;
          i++;
          timer = setTimeout(sortStep, 100);
        }
      } else {
        setIsSorted(true);
        setSortingIndices([-1, -1]);
        setSortedCount(arr.length);
        sorted = true;
        timer = setTimeout(sortStep, 2000);
      }
    };

    timer = setTimeout(sortStep, 500);
    return () => clearTimeout(timer);
  }, []);

  const codeSnippet = `function hasPath(g, src, dst) {
  if (src === dst) return true;
  for (let n of g[src]) {
    if (hasPath(g, n, dst)) 
      return true;
  }
  return false;
}`;

  const [typedCode, setTypedCode] = useState("");

  useEffect(() => {
    let index = 0;
    let timer: NodeJS.Timeout;

    const type = () => {
      if (index < codeSnippet.length) {
        setTypedCode(codeSnippet.slice(0, index + 1));
        index++;
        timer = setTimeout(type, 45);
      } else {
        timer = setTimeout(() => {
          setTypedCode("");
          index = 0;
          timer = setTimeout(type, 45);
        }, 3000);
      }
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

  const renderCodeTokens = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\/\/.*|\bfunction\b|\breturn\b|\bif\b|\btrue\b|\bfalse\b|\blet\b|\bfor\b|\bof\b)/g);
      return (
        <div key={i} style={{ minHeight: "1.2em" }}>
          {parts.map((part, j) => {
            if (!part) return null;
            if (part.startsWith("//")) {
              return <span key={j} className={styles.comment}>{part}</span>;
            }
            if (
              part === "function" ||
              part === "return" ||
              part === "if" ||
              part === "let" ||
              part === "for" ||
              part === "of"
            ) {
              return <span key={j} className={styles.keyword}>{part}</span>;
            }
            if (part === "true" || part === "false") {
              return <span key={j} className={styles.string}>{part}</span>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  const getCardClassName = (index: number, baseFloatClass: string | undefined) => {
    const base = styles.glassCard ?? "";
    const float = baseFloatClass ?? "";
    if (hoveredIndex === null) {
      return `${base} ${float}`;
    }
    const active = styles.cardActive ?? "";
    const inactive = styles.cardInactive ?? "";
    return hoveredIndex === index
      ? `${base} ${active}`
      : `${base} ${inactive}`;
  };

  const getCardStyle = (index: number) => {
    const stylesMap: Record<number, Record<string, string>> = {
      0: { "--tx": "-35px", "--ty": "-85px", "--rot": "-4.5deg" },
      1: { "--tx": "35px", "--ty": "15px", "--rot": "3deg" },
      2: { "--tx": "-15px", "--ty": "115px", "--rot": "-1.5deg" },
    };
    return stylesMap[index] as React.CSSProperties;
  };

  return (
    <div className={styles.rightSection}>
      <div className={styles.workspaceGrid} />
      <div className={styles.workspaceGlow} />
      <div className={styles.workspaceGlowOrange} />

      <div className={styles.cardStack}>
        <div
          className={getCardClassName(0, styles.card1)}
          style={getCardStyle(0)}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIcon}>🌳</span>
              <span className={`${styles.cardTitle} ${styles.cardTitle1}`}>
                Binary Trees
              </span>
            </div>
            <span className={styles.cardBadge}>Visualizer</span>
          </div>
          <p className={styles.cardDescription}>
            Understand complex structures visually. Watch tree traversals run step-by-step.
          </p>
          <div className={styles.visualContainer}>
            <svg width="220" height="80" viewBox="0 0 220 80" style={{ overflow: "visible" }}>
              <line
                x1="110"
                y1="15"
                x2="60"
                y2="45"
                className={`${styles.treeLink} ${
                  activeNode === 1 || activeNode === 2
                    ? styles.treeLinkActive
                    : ""
                }`}
              />
              <line
                x1="110"
                y1="15"
                x2="160"
                y2="45"
                className={`${styles.treeLink} ${
                  activeNode === 1 || activeNode === 3 ? styles.treeLinkActive : ""
                }`}
              />
              <line
                x1="60"
                y1="45"
                x2="30"
                y2="70"
                className={`${styles.treeLink} ${
                  activeNode === 2 || activeNode === 4 ? styles.treeLinkActive : ""
                }`}
              />
              <line
                x1="60"
                y1="45"
                x2="90"
                y2="70"
                className={`${styles.treeLink} ${
                  activeNode === 2 || activeNode === 5 ? styles.treeLinkActive : ""
                }`}
              />

              <circle
                cx="110"
                cy="15"
                r="7"
                className={`${styles.treeNode} ${
                  activeNode === 1 ? styles.treeNodeActive : ""
                }`}
              />
              <circle
                cx="60"
                cy="45"
                r="7"
                className={`${styles.treeNode} ${
                  activeNode === 2 ? styles.treeNodeActive : ""
                }`}
              />
              <circle
                cx="160"
                cy="45"
                r="7"
                className={`${styles.treeNode} ${
                  activeNode === 3 ? styles.treeNodeBlue : ""
                }`}
              />
              <circle
                cx="30"
                cy="70"
                r="7"
                className={`${styles.treeNode} ${
                  activeNode === 4 ? styles.treeNodeActive : ""
                }`}
              />
              <circle
                cx="90"
                cy="70"
                r="7"
                className={`${styles.treeNode} ${
                  activeNode === 5 ? styles.treeNodeActive : ""
                }`}
              />
            </svg>
          </div>
        </div>

        <div
          className={getCardClassName(1, styles.card2)}
          style={getCardStyle(1)}
          onMouseEnter={() => setHoveredIndex(1)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIcon}>⚡</span>
              <span className={`${styles.cardTitle} ${styles.cardTitle2}`}>
                Algorithms
              </span>
            </div>
            <span className={styles.cardBadge}>Active sort</span>
          </div>
          <p className={styles.cardDescription}>
            Master problem solving techniques. Grasp sorting and searching mechanics.
          </p>
          <div className={styles.visualContainer}>
            <div className={styles.sortingBars}>
              {array.map((val, idx) => {
                let barClass = styles.sortingBar;
                if (idx === sortingIndices[0]) {
                  barClass += ` ${styles.sortingBarActive1}`;
                } else if (idx === sortingIndices[1]) {
                  barClass += ` ${styles.sortingBarActive2}`;
                } else if (isSorted || idx <= sortedCount) {
                  barClass += ` ${styles.sortingBarSorted}`;
                }
                return (
                  <div
                    key={idx}
                    className={barClass}
                    style={{ height: `${val}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={getCardClassName(2, styles.card3)}
          style={getCardStyle(2)}
          onMouseEnter={() => setHoveredIndex(2)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIcon}>💻</span>
              <span className={`${styles.cardTitle} ${styles.cardTitle3}`}>
                Coding Challenges
              </span>
            </div>
            <span className={styles.cardBadge}>IDE</span>
          </div>
          <p className={styles.cardDescription}>
            Practice real interview problems. Compile and test in sandboxed environments.
          </p>
          <div className={`${styles.visualContainer}`} style={{ height: "100px", padding: "10px" }}>
            <div className={styles.terminalContainer}>
              <div className={styles.terminalControls}>
                <span className={`${styles.terminalDot} ${styles.dotRed}`} />
                <span className={`${styles.terminalDot} ${styles.dotYellow}`} />
                <span className={`${styles.terminalDot} ${styles.dotGreen}`} />
              </div>
              <pre className={styles.terminalCode}>
                {renderCodeTokens(typedCode)}
                <span className={styles.cursor} />
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.notificationCard}>
        <span className={styles.notifFire}>🔥</span>
        <div className={styles.notifContent}>
          <span className={styles.notifTitle}>Daily Challenge Completed</span>
          <span className={styles.notifSub}>Keep improving your problem solving skills</span>
        </div>
      </div>
    </div>
  );
}

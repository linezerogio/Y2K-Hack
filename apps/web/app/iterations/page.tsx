import Link from "next/link";

const IDS = [
  "7",
  "10",
  "16",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
];

export default function IterationsIndex() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5edd6",
        fontFamily: "Tahoma, Verdana, sans-serif",
        padding: 40,
      }}
    >
      <h1 style={{ marginTop: 0 }}>GeoStumble — iteration previews</h1>
      <p style={{ maxWidth: 560, lineHeight: 1.5 }}>
        Open a route below to compare design concepts. The current production
        landing is iteration <strong>41</strong> (now at <code>/</code>), and
        the stumble result shell lives at <code>/stumble</code>.
      </p>
      <ul style={{ lineHeight: 2 }}>
        {IDS.map((id) => (
          <li key={id}>
            <Link href={`/iterations/${id}`}>Iteration {id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

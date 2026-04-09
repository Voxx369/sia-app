import { useState } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import TeacherDashboardShell from "../components/TeacherDashboardShell";
import { useAuth } from "../context/AuthContext";

const payoutHistory = [
  { id: 1, date: "2026-01-31", amount: "640 EUR", status: "Paye" },
  { id: 2, date: "2025-12-31", amount: "590 EUR", status: "Paye" },
  { id: 3, date: "2025-11-30", amount: "520 EUR", status: "Paye" },
];

export default function DashboardWithdraw() {
  const { token, user } = useAuth();
  const [requestAmount, setRequestAmount] = useState("");
  const [note, setNote] = useState("");

  if (!token) return <Navigate to="/dashboard" replace />;
  if (user?.role !== "teacher") return <Navigate to="/dashboard/my-courses" replace />;

  return (
    <TeacherDashboardShell
      title="Retraits"
      subtitle="Suivez votre solde disponible et vos demandes de retrait."
    >
      <div className="teacher-panel-grid teacher-panel-grid-3">
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Solde disponible</p>
          <p className="teacher-kpi">780 EUR</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">En attente</p>
          <p className="teacher-kpi">120 EUR</p>
        </section>
        <section className="teacher-panel">
          <p className="teacher-kpi-label">Retraits effectues</p>
          <p className="teacher-kpi">3</p>
        </section>
      </div>

      <div className="teacher-panel-grid teacher-panel-grid-2">
        <section className="teacher-panel">
          <h2>Nouvelle demande</h2>
          <form
            className="teacher-form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              setNote("Demande enregistree (mode demo).");
              setRequestAmount("");
              setTimeout(() => setNote(""), 2500);
            }}
          >
            <label>
              Montant (EUR)
              <input
                className="teacher-input"
                type="number"
                min="10"
                step="10"
                value={requestAmount}
                onChange={(event) => setRequestAmount(event.target.value)}
                placeholder="Ex: 200"
              />
            </label>
            <Button type="submit" variant="primary" size="medium">
              Envoyer la demande
            </Button>
            {note && <p>{note}</p>}
          </form>
        </section>

        <section className="teacher-panel">
          <h2>Historique</h2>
          <div className="teacher-table-wrap">
            <table className="teacher-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payoutHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.amount}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </TeacherDashboardShell>
  );
}

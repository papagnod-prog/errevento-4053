import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";
import { Layout } from "./components/layout";
import { LegacyRedirect } from "./components/legacy-redirect";
import { VisitTracker } from "./components/visit-tracker";
import Index from "./pages/index";
import Catalogo from "./pages/catalogo";
import Prodotto from "./pages/prodotto";
import ChiSiamo from "./pages/chi-siamo";
import Allestimenti from "./pages/allestimenti";
import WeddingPlanner from "./pages/wedding-planner";
import Contatti from "./pages/contatti";
import Admin from "./pages/admin";
import Privacy from "./pages/privacy";
import CookiePolicy from "./pages/cookie-policy";

function App() {
  return (
    <Provider>
      <VisitTracker />
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/catalogo" component={Catalogo} />
          <Route path="/prodotto/:slug" component={Prodotto} />
          <Route path="/chi-siamo" component={ChiSiamo} />
          <Route path="/allestimenti" component={Allestimenti} />
          <Route path="/wedding-planner" component={WeddingPlanner} />
          <Route path="/contatti" component={Contatti} />
          <Route path="/admin" component={Admin} />
          <Route path="/privacy-policy" component={Privacy} />
          <Route path="/cookie-policy" component={CookiePolicy} />
          <Route component={LegacyRedirect} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;

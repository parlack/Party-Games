import { type RouteConfig, index } from "@react-router/dev/routes";
import { route } from "@react-router/dev/routes";

export default [
    index("routes/landingpage.tsx"),
    route("/waitingroom/:roomCode", "routes/waitingroom.tsx")
] satisfies RouteConfig;

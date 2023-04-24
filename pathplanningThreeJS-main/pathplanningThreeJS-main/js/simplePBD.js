export function step(RADIUS, sceneEntities, world) {
    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    const AGENTSIZE = RADIUS * 2;
    const epsilon = 0.0001;
    const timestep = 0.03;
    
    /*  -----------------------  */
    /*  TODO modify lines below  */
    /*  -----------------------  */
    function collisionConstraint(agent_i, agent_j) {
        let d = distance(agent_i.px, agent_i.pz, agent_j.px, agent_j.pz);
        let coll_d = d - AGENTSIZE;

        if(d > epsilon && coll_d < 0 ){    
            let dirx = agent_i.px - agent_j.px;
            let dirz = agent_i.pz - agent_j.pz;
          
            let deltaix = -0.5 * coll_d * dirx/d;
            let deltaiz = -0.5 * coll_d * dirz/d;

            let deltajx = 0.5 * coll_d * dirx/d;
            let deltajz = 0.5 * coll_d * dirz/d;

            agent_i.px += (deltaix);
            agent_i.pz += (deltaiz);

            agent_j.px += (deltajx);
            agent_j.pz += (deltajz); 

        }
        
    }
    /*  -----------------------  */
    sceneEntities.forEach(function(item) {
        item.px = item.x + timestep * item.vx;
        item.pz = item.z + timestep * item.vz;
        item.py = item.y + timestep * item.vy;
    });


    var i = 0,
        j;
    while (i < sceneEntities.length) {
        j = i + 1;
        while (j < sceneEntities.length) {
            /*  TODO modify lines below if needed */
            /*  --------------------------------  */
            collisionConstraint(sceneEntities[i], sceneEntities[j]);
            let d = distance(sceneEntities[i].x, sceneEntities[i].z, sceneEntities[j].x, sceneEntities[j].z);
            let coll_d = d - AGENTSIZE;

            if(coll_d < 0 && d > epsilon){         
                sceneEntities[i].colliding = true;
                sceneEntities[j].colliding = true;
            }
            /*  --------------------------------  */
            j += 1;
        }
        i += 1
    }

    sceneEntities.forEach(function(item) {
        item.vx = (item.px - item.x) / timestep;
        item.vz = (item.pz - item.z) / timestep;
        item.vy = (item.py - item.y) / timestep;
        item.x = item.px;
        item.z = item.pz;
        item.y = item.py;

        if (item.x < -world.x / 2) {
            item.x = world.x / 2 - epsilon;
        } else if (item.x > world.x / 2) {
            item.x = -world.x / 2 + epsilon;
        }
        if (item.z < -world.z / 2) {
            item.z = world.z / 2 - epsilon;
        } else if (item.z > world.z / 2) {
            item.z = -world.z / 2 + epsilon;
        }
    });

}
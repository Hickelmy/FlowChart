import { ClassicPreset as Classic, GetSchemes, NodeEditor } from "rete";

import { Area2D, AreaPlugin } from "rete-area-plugin";
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from "rete-connection-plugin";
import {
  ReactPlugin,
  ReactArea2D,
  Presets as ReactPresets,
} from "rete-react-plugin";
import { createRoot } from "react-dom/client";

type Node = NumberNode | AddNode;
type Conn =
  | Connection<NumberNode, AddNode>
  | Connection<AddNode, AddNode>
  | Connection<AddNode, NumberNode>;
type Schemes = GetSchemes<Node, Conn>;

class Connection<A extends Node, B extends Node> extends Classic.Connection<
  A,
  B
> {}

// class NumberNode extends Classic.Node {
//   constructor(initial: number, change?: (value: number) => void) {
//     super('Maquina');

//     this.addOutput('value', new Classic.Output(socket, 'Number'));
//     this.addControl(
//       'value',
//       new Classic.InputControl('number', { initial, change })
//     );
//   }
// }

class NumberNode extends Classic.Node {
  width = 180;
  height = 120;

  constructor(initial: boolean, change?: (value: boolean) => void) {
    super("Maquina");

    this.addOutput("value", new Classic.Output(socket, "Status"));

    this.addControl(
      "value",
      new Classic.InputControl("text", { initial, change })
    );

    // this.addControl(
    //   'value',
    //   new Classic.InputControl('number', { initial, change })
    // );
  }
}

class AddNode extends Classic.Node {
  width = 480;
  height = 220;
  constructor(inputCount: number) {
    super("Processos");

    for (let i = 0; i < inputCount; i++) {
      this.addInput(`input${i}`, new Classic.Input(socket, `Input ${i}`));
    }

    // this.addInput('a', new Classic.Input(socket, 'A'));
    // this.addInput('b', new Classic.Input(socket, 'B'));

    this.addOutput("value", new Classic.Output(socket, "Status"));
    this.addControl(
      "result",
      new Classic.InputControl("number", { initial: 0, readonly: true })
    );
  }
}

type AreaExtra = Area2D<Schemes> | ReactArea2D<Schemes>;

const socket = new Classic.Socket("socket");

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, AreaExtra>(container);
  const connection = new ConnectionPlugin<Schemes, AreaExtra>();
  const reactRender = new ReactPlugin<Schemes, AreaExtra>({ createRoot });

  editor.use(area);
  area.use(reactRender);
  area.use(connection);

  connection.addPreset(ConnectionPresets.classic.setup());
  reactRender.addPreset(ReactPresets.classic.setup());

  const fixedNumberNodes = Array.from(
    { length: 20 },
    () => new NumberNode(false)
  );

  const add = new AddNode(fixedNumberNodes.length);

  const startX = 100;
  const startY = 0;
  let currentX = startX;
  let currentY = startY;
  let verticalOnce = false; 

  fixedNumberNodes.forEach(async (node, index) => {


    await editor.addNode(node);

    console.log('verticalOnce : ' , verticalOnce);
    console.log('index : ' , currentX * (index));

    if (!verticalOnce && currentX * (index) >= 1000) {
      console.log('currentX : ' , currentX);
      console.log('Devo ir para a vertical ')
      verticalOnce = true;  
    
    }

if (verticalOnce){
  currentX = startX;
  currentY += 200;
  await area.nodeViews.get(node.id)?.translate(currentX * (index), currentY);
  
}

    currentX += 200;

    console.log('index : ' , index);

    console.log('verticalOnce : ' , verticalOnce);
    console.log('currentX : ' , currentX);
    console.log('currentY : ' , currentY);

    if (currentX >= 1000) {
      currentX = startX;
      currentY += 200;
      verticalOnce = false;
    }

    console.log('currentX : ' , currentX);
    console.log('currentY : ' , currentY);
  });

  // await editor.addNode(add);
  await area.nodeViews.get(add.id)?.translate(0, 0);

  return {
    destroy: () => area.destroy(),
  };
}


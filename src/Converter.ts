import { FeederFactory } from "./factory/FeederFactory";
import { LineFactory } from "./factory/LineFactory";
import { NodeFactory } from "./factory/NodeFactory";
import { Feeder } from "./model/Feeder";
import { FeederData } from "./model/FeederData";
import { Line } from "./model/Line";
import { LineCodeData } from "./model/LineCodeData";
import { Node } from "./model/Node";
import { PositionData } from "./model/PositionData";

export class Converter {
  private readonly feederFactory: FeederFactory;
  private readonly nodeFactory: NodeFactory;
  private readonly lineFactory: LineFactory;

  constructor() {
    this.feederFactory = new FeederFactory();
    this.nodeFactory = new NodeFactory();
    this.lineFactory = new LineFactory();
  }

  toFeeder(networkNum: number, feederNum: number): Feeder {
    return this.feederFactory.create({ networkNum, feederNum });
  }

  toNodes(
    feederId: number,
    feederData: FeederData,
    positionData: PositionData
  ): Node[] {
    const nodes = positionData.map((node) => {
      const hasLoad = () => {
        if (node.num === 1) return false;
        const matchedLine = feederData.find(
          (line) => line.nextNodeNum === node.num
        );
        if (!matchedLine) throw new Error("matchedLine must not be undefined.");
        return matchedLine.hasLoad;
      };

      return {
        feederId,
        num: node.num,
        posX: node.posX,
        posY: node.posY,
        hasLoad: hasLoad(),
      };
    });

    return nodes.map((n) => this.nodeFactory.create(n));
  }

  toLines(
    feederId: number,
    nodes: Node[],
    feederData: FeederData,
    lineCodeData: LineCodeData
  ): Line[] {
    const lines = feederData.map((line) => {
      const matchedLineCode = lineCodeData.find(
        (lineCode) => lineCode.code === line.code
      );

      if (!matchedLineCode)
        throw new Error("matchedLineCode must not be undefined.");

      const prevNode = nodes.find((node) => node.num === line.prevNodeNum);
      const nextNode = nodes.find((node) => node.num === line.nextNodeNum);

      if (!prevNode) throw new Error("prevNode must not be undefined.");
      if (!nextNode) throw new Error("nextNot must not be undefined.");

      return {
        feederId,
        prevNodeId: prevNode.id,
        nextNodeId: nextNode.id,
        lengthM: line.lengthM,
        phase: line.phase,
        code: line.code,
        rOhmPerKm: matchedLineCode.rOhmPerKm,
        xOhmPerKm: matchedLineCode.xOhmPerKm,
      };
    });

    return lines.map((l) => this.lineFactory.create(l));
  }
}